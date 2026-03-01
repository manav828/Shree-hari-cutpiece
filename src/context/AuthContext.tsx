"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Order {
    id: string;
    date: string;
    status: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
    paymentStatus: "pending" | "paid" | "refunded";
    paymentMethod: string;
    trackingUrl?: string;
    items: {
        id: string;
        name: string;
        image: string;
        meters: number;
        price: number;
    }[];
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
    signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock order history data (will be replaced by Firebase later)
const MOCK_ORDERS: Order[] = [
    {
        id: "SH-2024-001",
        date: "2024-12-15",
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "WhatsApp / Cash on Delivery",
        trackingUrl: undefined,
        items: [
            { id: "1", name: "Premium Banarasi Silk", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80", meters: 5, price: 1850 },
            { id: "2", name: "Cotton Chanderi Fabric", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=80", meters: 3, price: 650 },
        ],
        total: 11200,
        shippingCost: 0,
        address: "12, MG Road, Ahmedabad, Gujarat - 380001",
        phone: "+91 98765 43210",
    },
    {
        id: "SH-2025-002",
        date: "2025-01-22",
        status: "shipped",
        paymentStatus: "paid",
        paymentMethod: "WhatsApp / UPI",
        trackingUrl: "https://www.delhivery.com/track/package/123456789",
        items: [
            { id: "3", name: "Pure Georgette Chiffon", image: "https://images.unsplash.com/photo-1594938298598-70f70df33100?w=200&q=80", meters: 6, price: 1200 },
        ],
        total: 7299,
        shippingCost: 99,
        address: "12, MG Road, Ahmedabad, Gujarat - 380001",
        phone: "+91 98765 43210",
    },
    {
        id: "SH-2025-003",
        date: "2025-02-10",
        status: "confirmed",
        paymentStatus: "pending",
        paymentMethod: "WhatsApp / Pay on Delivery",
        trackingUrl: undefined,
        items: [
            { id: "4", name: "Kanjivaram Silk Saree", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80", meters: 8, price: 3200 },
            { id: "5", name: "Embroidered Net Fabric", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&q=80", meters: 2, price: 950 },
        ],
        total: 27500,
        shippingCost: 0,
        address: "12, MG Road, Ahmedabad, Gujarat - 380001",
        phone: "+91 98765 43210",
    },
    {
        id: "SH-2025-004",
        date: "2025-03-01",
        status: "placed",
        paymentStatus: "pending",
        paymentMethod: "WhatsApp / Pay on Delivery",
        trackingUrl: undefined,
        items: [
            { id: "6", name: "Linen Blend Shirting", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=200&q=80", meters: 4, price: 580 },
        ],
        total: 2419,
        shippingCost: 99,
        address: "12, MG Road, Ahmedabad, Gujarat - 380001",
        phone: "+91 98765 43210",
    },
];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("shrihari_user");
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch {
            // Ignore parse errors
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        // Simulate network delay (will be replaced by Firebase Auth)
        await new Promise((r) => setTimeout(r, 800));

        // Mock: accept any email with password length >= 6
        if (!email || !password) {
            setIsLoading(false);
            return { success: false, error: "Please fill in all fields." };
        }
        if (password.length < 6) {
            setIsLoading(false);
            return { success: false, error: "Password must be at least 6 characters." };
        }

        const mockUser: User = {
            id: "usr_" + Math.random().toString(36).slice(2, 9),
            name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            email,
        };

        setUser(mockUser);
        localStorage.setItem("shrihari_user", JSON.stringify(mockUser));
        setIsLoading(false);
        return { success: true };
    };

    const signup = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 800));

        if (!name || !email || !password) {
            setIsLoading(false);
            return { success: false, error: "Please fill in all required fields." };
        }
        if (password.length < 6) {
            setIsLoading(false);
            return { success: false, error: "Password must be at least 6 characters." };
        }

        const newUser: User = {
            id: "usr_" + Math.random().toString(36).slice(2, 9),
            name,
            email,
            phone,
        };

        setUser(newUser);
        localStorage.setItem("shrihari_user", JSON.stringify(newUser));
        setIsLoading(false);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("shrihari_user");
    };

    const updateProfile = (data: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...data };
        setUser(updated);
        localStorage.setItem("shrihari_user", JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, orders: MOCK_ORDERS, isLoading, login, signup, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
