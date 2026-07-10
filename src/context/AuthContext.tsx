"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/* ─── Types ─── */
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
}

export interface OrderItem {
    id: string;
    product_id?: string | null;
    product_name: string;
    color_name: string | null;
    image_url: string | null;
    quantity_or_meters: number;
    price_per_unit: number;
    variant_id: string | null;
    selling_mode?: "meter" | "piece";
    selected_options_json?: Array<{
        group_name?: string | null;
        value_labels?: string[] | null;
        input_value?: string | number | null;
    }> | null;
}

export interface Order {
    id: string;
    order_number: string;
    date: string;
    status: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returning" | "returned" | "replacing" | "replaced";
    paymentStatus: "pending" | "paid" | "refunded";
    paymentMethod: string;
    trackingUrl?: string;
    items: OrderItem[];
    total: number;
    shippingCost: number;
    address: string;
    phone: string;
}

interface AuthContextType {
    user: User | null;
    orders: Order[];
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; hasSession?: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => void;
    refreshOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* ─── Helper: map Supabase user + profile to our User ─── */
function mapUser(su: SupabaseUser, profile?: { full_name: string; phone: string; avatar_url: string | null }): User {
    return {
        id: su.id,
        name: profile?.full_name || su.user_metadata?.full_name || su.email?.split("@")[0] || "",
        email: su.email || "",
        phone: profile?.phone || su.user_metadata?.phone || "",
        avatarUrl: profile?.avatar_url || undefined,
    };
}

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /* Fetch profile from our profiles table */
    const fetchProfile = useCallback(async (su: SupabaseUser) => {
        const { data } = await supabase
            .from("profiles")
            .select("full_name, phone, avatar_url")
            .eq("id", su.id)
            .single();
        setUser(mapUser(su, data || undefined));
    }, []);

    /* Fetch orders from Supabase */
    const fetchOrdersByUserId = useCallback(async (currentUserId: string | null) => {

        if (!currentUserId) {
            setOrders([]);
            return;
        }

        const { data: ordersData } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false });

        if (!ordersData || ordersData.length === 0) {
            setOrders([]);
            return;
        }

        // Fetch items for all orders
        const ordersDataList = ordersData as any[];
        const orderIds = ordersDataList.map((o) => o.id);
        const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .in("order_id", orderIds);

        const itemsByOrder: Record<string, OrderItem[]> = {};
        const itemsDataList = (itemsData as any[]) || [];
        itemsDataList.forEach((item) => {
            if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
            itemsByOrder[item.order_id].push({
                id: item.id,
                product_id: item.product_id || null,
                product_name: item.product_name,
                color_name: item.color_name,
                image_url: item.image_url,
                quantity_or_meters: item.quantity_or_meters,
                price_per_unit: item.price_per_unit,
                variant_id: item.variant_id,
                selling_mode: item.selling_mode || "meter",
                selected_options_json: item.selected_options_json || null,
            });
        });

        const mapped: Order[] = ordersDataList.map((o) => ({
            id: o.id,
            order_number: o.order_number,
            date: o.created_at,
            status: o.status,
            paymentStatus: o.payment_status,
            paymentMethod: o.payment_method || "",
            trackingUrl: o.tracking_url || undefined,
            items: itemsByOrder[o.id] || [],
            total: o.total_amount,
            shippingCost: o.shipping_cost,
            address: o.delivery_address,
            phone: o.contact_phone,
        }));

        setOrders(mapped);
    }, []);

    /* Listen for auth state changes */
    useEffect(() => {
        // Get the initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            try {
                if (session?.user) {
                    await fetchProfile(session.user);
                    await fetchOrdersByUserId(session.user.id);
                }
            } catch (err) {
                console.error("Error fetching initial session profile/orders:", err);
            } finally {
                setIsLoading(false);
            }
        }).catch((err) => {
            console.error("getSession error:", err);
            setIsLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setIsLoading(true);
                try {
                    if (session?.user) {
                        await fetchProfile(session.user);
                        await fetchOrdersByUserId(session.user.id);
                    } else {
                        setUser(null);
                        setOrders([]);
                    }
                } catch (err) {
                    console.error("onAuthStateChange handling error:", err);
                } finally {
                    setIsLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile, fetchOrdersByUserId]);

    /* ─── Auth Methods ─── */
    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        return { success: true };
    };

    const signup = async (name: string, email: string, phone: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name, phone },
            },
        });
        if (error) return { success: false, error: error.message };

        // Asynchronously trigger welcome registration notification in the background
        if (data.user) {
            fetch("/api/notifications/welcome", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, phone, name, userId: data.user.id })
            }).catch(console.error);
        }

        return { success: true, hasSession: !!data.session };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setOrders([]);
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;
        const updates: any = {};
        if (data.name) updates.full_name = data.name;
        if (data.phone) updates.phone = data.phone;

        // @ts-ignore - bypassing never compilation inference
        await supabase.from("profiles").update(updates).eq("id", user.id);

        // Also update user_profiles table to keep both in sync
        // @ts-ignore - bypassing never compilation inference
        await supabase.from("user_profiles").update(updates).eq("id", user.id);

        setUser((prev) => (prev ? { ...prev, ...data } : prev));
    };

    const refreshOrders = async () => {
        await fetchOrdersByUserId(user?.id || null);
    };

    return (
        <AuthContext.Provider value={{ user, orders, isLoading, login, signup, logout, updateProfile, refreshOrders }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
