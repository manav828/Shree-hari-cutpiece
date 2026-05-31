"use client";

import PaymentSettingsManager from "@/components/admin/settings/PaymentSettingsManager";

export default function AdminPayments() {
    return (
        <div className="max-w-5xl">
            <h1 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Payment Gateways</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <PaymentSettingsManager />
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Extensible Payment System</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Payment options are managed dynamically through self-contained directories. Deleting a payment folder automatically uninstalls the gateway from both the admin configuration and the storefront checkout.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
