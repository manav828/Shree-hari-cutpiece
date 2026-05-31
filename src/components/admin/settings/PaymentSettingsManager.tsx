"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, CreditCard, Eye, EyeOff, ShieldCheck } from "lucide-react";

type GatewayField = {
    key: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    helpText?: string;
    value: string;
};

type Gateway = {
    id: string;
    name: string;
    description: string;
    isEnabledKey: string;
    enabled: boolean;
    fields: GatewayField[];
};

export default function PaymentSettingsManager() {
    const [gateways, setGateways] = useState<Gateway[]>([]);
    const [enabledStates, setEnabledStates] = useState<Record<string, boolean>>({});
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");

    const fetchPaymentSettings = async () => {
        try {
            const res = await fetch("/api/admin/payment-settings");
            if (!res.ok) throw new Error("Failed to load settings");
            const json = await res.json();
            const data: Gateway[] = json.gateways || [];
            
            setGateways(data);

            const initialEnabled: Record<string, boolean> = {};
            const initialValues: Record<string, string> = {};
            
            data.forEach((gw) => {
                initialEnabled[gw.isEnabledKey] = gw.enabled;
                if (gw.fields) {
                    gw.fields.forEach((f) => {
                        initialValues[f.key] = f.value;
                    });
                }
            });

            setEnabledStates(initialEnabled);
            setFieldValues(initialValues);
        } catch (err) {
            console.error("Error loading payment settings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentSettings();
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleToggle = (key: string, checked: boolean) => {
        setEnabledStates((prev) => ({
            ...prev,
            [key]: checked,
        }));
    };

    const handleFieldChange = (key: string, value: string) => {
        setFieldValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const toggleSecret = (key: string) => {
        setShowSecrets((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation: Verify all enabled gateways have required fields filled
        for (const gw of gateways) {
            const isEnabled = enabledStates[gw.isEnabledKey];
            if (isEnabled && gw.fields) {
                for (const f of gw.fields) {
                    const value = fieldValues[f.key] || "";
                    if (f.required && !value.trim()) {
                        alert(`Please fill in the "${f.label}" for ${gw.name}.`);
                        return;
                    }
                }
            }
        }

        setSaving(true);
        try {
            // Build body with enabled states and field values
            const payload: Record<string, any> = {};
            
            gateways.forEach((gw) => {
                payload[gw.isEnabledKey] = enabledStates[gw.isEnabledKey];
                if (gw.fields) {
                    gw.fields.forEach((f) => {
                        payload[f.key] = fieldValues[f.key] || "";
                    });
                }
            });

            const res = await fetch("/api/admin/payment-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to save settings");
            
            setToast("Payment settings updated successfully.");
            // Refresh to update masked values
            await fetchPaymentSettings();
        } catch (err) {
            console.error("Failed to save payment settings:", err);
            alert("Failed to save payment settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (gateways.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center py-8">
                <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">No payment gateways are currently installed in the project.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-2xl animate-fade-in">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium">{toast}</span>
                </div>
            )}

            <div className="mb-5 flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-700" />
                        Payment Gateways
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure Cash on Delivery and online payment gateways for the storefront checkout.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {gateways.map((gw) => {
                    const isEnabled = enabledStates[gw.isEnabledKey] || false;
                    const hasFields = gw.fields && gw.fields.length > 0;
                    
                    return (
                        <div 
                            key={gw.id} 
                            className={`p-4 rounded-xl border transition-all duration-300 ${
                                isEnabled 
                                    ? gw.id === "razorpay" 
                                        ? "border-indigo-100 bg-indigo-50/10" 
                                        : "border-gray-900 bg-gray-50/30"
                                    : "border-gray-100 bg-gray-50/30"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{gw.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{gw.description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isEnabled}
                                        onChange={(e) => handleToggle(gw.isEnabledKey, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                                        gw.id === "razorpay" ? "peer-checked:bg-indigo-600" : "peer-checked:bg-gray-950"
                                    }`}></div>
                                </label>
                            </div>

                            {isEnabled && hasFields && (
                                <div className="space-y-4 pt-4 border-t border-gray-100 mt-3 animate-fade-in">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {gw.fields.map((f) => {
                                            const showSecret = showSecrets[f.key] || false;
                                            return (
                                                <div key={f.key}>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                                        {f.label} {f.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={f.type === "password" && !showSecret ? "password" : "text"}
                                                            value={fieldValues[f.key] || ""}
                                                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                                                            placeholder={f.placeholder || ""}
                                                            required={f.required}
                                                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white placeholder:text-gray-300"
                                                        />
                                                        {f.type === "password" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSecret(f.key)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                                title={showSecret ? "Hide secret" : "Show secret"}
                                                            >
                                                                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {f.helpText && (
                                                        <p className="text-[10px] text-gray-400 mt-1">{f.helpText}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-indigo-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50 select-none">
                                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                        <span>Credentials are stored securely in the database. Frontend checkout requests only receive public configuration parameters.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="flex items-center justify-end border-t border-gray-100 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-950 hover:bg-gray-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
