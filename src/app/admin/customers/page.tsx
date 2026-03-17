"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminCustomerListItem, AdminCustomersListResponse } from "@/types/customers";
import CustomersFilters from "@/components/admin/customers/CustomersFilters";
import CustomersListTable from "@/components/admin/customers/CustomersListTable";
import type { ExtraFilterKey } from "@/components/admin/customers/CustomersFilters";

const CUSTOMER_FILTER_PREFS_KEY = "admin_customers_extra_filters";

export default function AdminCustomers() {
    const [customers, setCustomers] = useState<AdminCustomerListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [registeredAfter, setRegisteredAfter] = useState("");
    const [registeredBefore, setRegisteredBefore] = useState("");
    const [lastOrderAfter, setLastOrderAfter] = useState("");
    const [lastOrderBefore, setLastOrderBefore] = useState("");
    const [orderCount, setOrderCount] = useState("all");
    const [ltvMin, setLtvMin] = useState("");
    const [ltvMax, setLtvMax] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [visibleExtraFilters, setVisibleExtraFilters] = useState({
        registeredDate: false,
        lastOrderDate: false,
        ltv: false,
    });

    const applyExtraFilters = (next: Record<ExtraFilterKey, boolean>) => {
        const prev = visibleExtraFilters;
        setVisibleExtraFilters(next);
        setPage(1);

        if (prev.registeredDate && !next.registeredDate) {
            setRegisteredAfter("");
            setRegisteredBefore("");
        }
        if (prev.lastOrderDate && !next.lastOrderDate) {
            setLastOrderAfter("");
            setLastOrderBefore("");
        }
        if (prev.ltv && !next.ltv) {
            setLtvMin("");
            setLtvMax("");
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = window.sessionStorage.getItem(CUSTOMER_FILTER_PREFS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Record<ExtraFilterKey, boolean>;
            setVisibleExtraFilters({
                registeredDate: Boolean(parsed.registeredDate),
                lastOrderDate: Boolean(parsed.lastOrderDate),
                ltv: Boolean(parsed.ltv),
            });
        } catch {
            // Ignore malformed session data.
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.sessionStorage.setItem(CUSTOMER_FILTER_PREFS_KEY, JSON.stringify(visibleExtraFilters));
    }, [visibleExtraFilters]);

    const params = useMemo(() => {
        const query = new URLSearchParams();
        query.set("page", String(page));
        query.set("limit", String(limit));
        query.set("sortBy", "joined");
        if (search.trim()) query.set("search", search.trim());
        if (status !== "all") query.set("status", status);
        if (registeredAfter) query.set("registeredAfter", registeredAfter);
        if (registeredBefore) query.set("registeredBefore", registeredBefore);
        if (lastOrderAfter) query.set("lastOrderAfter", lastOrderAfter);
        if (lastOrderBefore) query.set("lastOrderBefore", lastOrderBefore);
        if (orderCount !== "all") query.set("orderCount", orderCount);
        if (ltvMin.trim()) query.set("ltvMin", ltvMin.trim());
        if (ltvMax.trim()) query.set("ltvMax", ltvMax.trim());
        return query.toString();
    }, [
        limit,
        page,
        search,
        status,
        registeredAfter,
        registeredBefore,
        lastOrderAfter,
        lastOrderBefore,
        orderCount,
        ltvMin,
        ltvMax,
    ]);

    const exportQuery = useMemo(() => {
        const query = new URLSearchParams();
        query.set("sortBy", "joined");
        if (search.trim()) query.set("search", search.trim());
        if (status !== "all") query.set("status", status);
        if (registeredAfter) query.set("registeredAfter", registeredAfter);
        if (registeredBefore) query.set("registeredBefore", registeredBefore);
        if (lastOrderAfter) query.set("lastOrderAfter", lastOrderAfter);
        if (lastOrderBefore) query.set("lastOrderBefore", lastOrderBefore);
        if (orderCount !== "all") query.set("orderCount", orderCount);
        if (ltvMin.trim()) query.set("ltvMin", ltvMin.trim());
        if (ltvMax.trim()) query.set("ltvMax", ltvMax.trim());
        return query.toString();
    }, [
        search,
        status,
        registeredAfter,
        registeredBefore,
        lastOrderAfter,
        lastOrderBefore,
        orderCount,
        ltvMin,
        ltvMax,
    ]);

    const triggerExport = () => {
        window.open(`/api/admin/customers/export?${exportQuery}`, "_blank");
    };

    useEffect(() => {
        let isMounted = true;

        const loadCustomers = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/admin/customers?${params}`);
                const json = (await res.json()) as AdminCustomersListResponse | { error?: string };

                if (!res.ok) {
                    const message = "error" in json ? (json.error || "Failed to fetch customers") : "Failed to fetch customers";
                    throw new Error(message);
                }

                if (!isMounted) return;

                const data = json as AdminCustomersListResponse;
                setCustomers(data.customers ?? []);
                setTotal(data.total ?? 0);
                setTotalPages(data.total_pages ?? 1);
            } catch (err: unknown) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to fetch customers");
                setCustomers([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCustomers();
        return () => {
            isMounted = false;
        };
    }, [params]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Customers</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} registered customers</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <CustomersFilters
                    search={search}
                    status={status}
                    orderCount={orderCount}
                    limit={limit}
                    registeredAfter={registeredAfter}
                    registeredBefore={registeredBefore}
                    lastOrderAfter={lastOrderAfter}
                    lastOrderBefore={lastOrderBefore}
                    ltvMin={ltvMin}
                    ltvMax={ltvMax}
                    visibleExtra={visibleExtraFilters}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    onStatusChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                    onOrderCountChange={(value) => {
                        setOrderCount(value);
                        setPage(1);
                    }}
                    onLimitChange={(value) => {
                        setLimit(value);
                        setPage(1);
                    }}
                    onRegisteredAfterChange={(value) => {
                        setRegisteredAfter(value);
                        setPage(1);
                    }}
                    onRegisteredBeforeChange={(value) => {
                        setRegisteredBefore(value);
                        setPage(1);
                    }}
                    onLastOrderAfterChange={(value) => {
                        setLastOrderAfter(value);
                        setPage(1);
                    }}
                    onLastOrderBeforeChange={(value) => {
                        setLastOrderBefore(value);
                        setPage(1);
                    }}
                    onLtvMinChange={(value) => {
                        setLtvMin(value);
                        setPage(1);
                    }}
                    onLtvMaxChange={(value) => {
                        setLtvMax(value);
                        setPage(1);
                    }}
                    onApplyExtraFilters={applyExtraFilters}
                    onExport={triggerExport}
                />
            </div>

            <div className="mt-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <CustomersListTable
                    customers={customers}
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    onPrevPage={() => setPage((prev) => Math.max(prev - 1, 1))}
                    onNextPage={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                />
            </div>
        </div>
    );
}
