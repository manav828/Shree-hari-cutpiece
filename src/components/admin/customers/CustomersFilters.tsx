"use client";

import { useState } from "react";

export type ExtraFilterKey = "registeredDate" | "lastOrderDate" | "ltv";

type Props = {
    search: string;
    status: string;
    orderCount: string;
    limit: number;
    registeredAfter: string;
    registeredBefore: string;
    lastOrderAfter: string;
    lastOrderBefore: string;
    ltvMin: string;
    ltvMax: string;
    visibleExtra: Record<ExtraFilterKey, boolean>;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onOrderCountChange: (value: string) => void;
    onLimitChange: (value: number) => void;
    onRegisteredAfterChange: (value: string) => void;
    onRegisteredBeforeChange: (value: string) => void;
    onLastOrderAfterChange: (value: string) => void;
    onLastOrderBeforeChange: (value: string) => void;
    onLtvMinChange: (value: string) => void;
    onLtvMaxChange: (value: string) => void;
    onApplyExtraFilters: (next: Record<ExtraFilterKey, boolean>) => void;
    onExport: () => void;
};

export default function CustomersFilters({
    search,
    status,
    orderCount,
    limit,
    registeredAfter,
    registeredBefore,
    lastOrderAfter,
    lastOrderBefore,
    ltvMin,
    ltvMax,
    visibleExtra,
    onSearchChange,
    onStatusChange,
    onOrderCountChange,
    onLimitChange,
    onRegisteredAfterChange,
    onRegisteredBeforeChange,
    onLastOrderAfterChange,
    onLastOrderBeforeChange,
    onLtvMinChange,
    onLtvMaxChange,
    onApplyExtraFilters,
    onExport,
}: Props) {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [draftExtra, setDraftExtra] = useState<Record<ExtraFilterKey, boolean>>(visibleExtra);

    const selectedCount = Object.values(visibleExtra).filter(Boolean).length;

    const openModal = () => {
        setDraftExtra(visibleExtra);
        setShowFilterModal(true);
    };

    const applyFilters = () => {
        onApplyExtraFilters(draftExtra);
        setShowFilterModal(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search by name, email or phone"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full lg:w-96 px-3 py-2 rounded-md border border-gray-300 text-sm"
                />

                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                </select>

                <select
                    value={orderCount}
                    onChange={(e) => onOrderCountChange(e.target.value)}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                >
                    <option value="all">All Orders</option>
                    <option value="0">0 Orders</option>
                    <option value="1-5">1-5 Orders</option>
                    <option value="5-10">5-10 Orders</option>
                    <option value="10+">10+ Orders</option>
                </select>

                <select
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                >
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                </select>

                <button
                    onClick={onExport}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50"
                >
                    Export CSV
                </button>

                <button
                    type="button"
                    onClick={openModal}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50"
                >
                    Advanced Filters{selectedCount > 0 ? ` (${selectedCount})` : ""}
                </button>
            </div>

            {(visibleExtra.registeredDate || visibleExtra.lastOrderDate || visibleExtra.ltv) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {visibleExtra.registeredDate && (
                        <>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Registered From</label>
                                <input
                                    type="date"
                                    value={registeredAfter}
                                    onChange={(e) => onRegisteredAfterChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Registered To</label>
                                <input
                                    type="date"
                                    value={registeredBefore}
                                    onChange={(e) => onRegisteredBeforeChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                />
                            </div>
                        </>
                    )}

                    {visibleExtra.lastOrderDate && (
                        <>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Last Order From</label>
                                <input
                                    type="date"
                                    value={lastOrderAfter}
                                    onChange={(e) => onLastOrderAfterChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Last Order To</label>
                                <input
                                    type="date"
                                    value={lastOrderBefore}
                                    onChange={(e) => onLastOrderBeforeChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                />
                            </div>
                        </>
                    )}

                    {visibleExtra.ltv && (
                        <>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">LTV Min (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={ltvMin}
                                    onChange={(e) => onLtvMinChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">LTV Max (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={ltvMax}
                                    onChange={(e) => onLtvMaxChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                    placeholder="50000"
                                />
                            </div>
                        </>
                    )}
                </div>
            )}

            {showFilterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-slate-800">Select Additional Filters</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Choose filters you want to enable in this session.</p>
                        </div>
                        <div className="p-4 space-y-3">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={draftExtra.registeredDate}
                                    onChange={(e) => setDraftExtra((prev) => ({ ...prev, registeredDate: e.target.checked }))}
                                />
                                Registered Date
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={draftExtra.lastOrderDate}
                                    onChange={(e) => setDraftExtra((prev) => ({ ...prev, lastOrderDate: e.target.checked }))}
                                />
                                Last Order Date
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={draftExtra.ltv}
                                    onChange={(e) => setDraftExtra((prev) => ({ ...prev, ltv: e.target.checked }))}
                                />
                                LTV Range
                            </label>
                        </div>
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFilterModal(false)}
                                className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="px-3 py-1.5 rounded-md border border-blue-600 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
