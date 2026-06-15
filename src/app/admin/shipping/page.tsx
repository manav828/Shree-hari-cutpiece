"use client";

import { useState, useEffect } from "react";
import { 
    Loader2, 
    Check, 
    Truck, 
    ShieldAlert, 
    CheckCircle2, 
    XCircle, 
    Edit3, 
    Plus, 
    Trash2, 
    Info, 
    Percent, 
    IndianRupee, 
    Tags,
    Settings,
    DollarSign,
    CheckSquare,
    Square,
    Globe
} from "lucide-react";

type ProviderOption = "manual" | "shiprocket" | "delhivery";

interface StateGroup {
    id: string;
    name: string;
    states: string[];
    charge: number;
}

const ALL_INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
];

export default function ShippingSettingsPage() {
    // Fulfillment Settings
    const [provider, setProvider] = useState<ProviderOption>("manual");
    const [shiprocketEmail, setShiprocketEmail] = useState("");
    const [shiprocketPassword, setShiprocketPassword] = useState("");
    const [delhiveryToken, setDelhiveryToken] = useState("");
    const [delhiverySandbox, setDelhiverySandbox] = useState(false);

    // Advanced Shipping Charges Settings
    const [defaultFee, setDefaultFee] = useState(99);
    const [freeThreshold, setFreeThreshold] = useState(999);
    const [stateGroups, setStateGroups] = useState<StateGroup[]>([]);

    // COD Charges & Advance Configuration
    const [codFee, setCodFee] = useState(0);
    const [codAdvanceType, setCodAdvanceType] = useState<"none" | "flat" | "percent">("none");
    const [codAdvanceValue, setCodAdvanceValue] = useState(0);

    // Tax Settings
    const [taxMode, setTaxMode] = useState<"none" | "add_extra" | "included">("none");
    const [taxRate, setTaxRate] = useState(0);

    // Page & UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [toast, setToast] = useState("");
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Edit Provider Modal State
    const [editModalProvider, setEditModalProvider] = useState<ProviderOption | null>(null);

    // State Group Builder Form State
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [groupName, setGroupName] = useState("");
    const [groupCharge, setGroupCharge] = useState(50);
    const [groupStates, setGroupStates] = useState<string[]>([]);

    useEffect(() => {
        let active = true;

        const loadSettings = async () => {
            try {
                const res = await fetch("/api/admin/shipping");
                if (!res.ok) throw new Error("Failed to load shipping settings");
                const data = await res.json();
                
                if (active) {
                    setProvider(data.provider as ProviderOption);
                    setShiprocketEmail(data.shiprocketEmail || "");
                    setShiprocketPassword(data.shiprocketPassword || "");
                    setDelhiveryToken(data.delhiveryToken || "");
                    setDelhiverySandbox(!!data.delhiverySandbox);

                    setDefaultFee(Number(data.defaultFee ?? 99));
                    setFreeThreshold(Number(data.freeThreshold ?? 999));
                    setCodFee(Number(data.codFee ?? 0));
                    setCodAdvanceType((data.codAdvanceType || "none") as "none" | "flat" | "percent");
                    setCodAdvanceValue(Number(data.codAdvanceValue ?? 0));

                    setTaxMode((data.taxMode || "none") as "none" | "add_extra" | "included");
                    setTaxRate(Number(data.taxRate ?? 0));

                    const parsedGroups = typeof data.stateGroups === "string" ? JSON.parse(data.stateGroups) : data.stateGroups;
                    setStateGroups(Array.isArray(parsedGroups) ? parsedGroups : []);
                }
            } catch (err) {
                console.error("Error loading shipping settings:", err);
                if (active) {
                    setToast("Error loading shipping settings.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadSettings();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(""), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        setTestResult(null);

        try {
            const res = await fetch("/api/admin/shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    shiprocketEmail,
                    shiprocketPassword,
                    delhiveryToken,
                    delhiverySandbox,
                    defaultFee,
                    freeThreshold,
                    codFee,
                    codAdvanceType,
                    codAdvanceValue,
                    stateGroups,
                    taxMode,
                    taxRate
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to save settings");
            }

            setToast("Shipping & Tax configuration saved successfully.");
        } catch (err: any) {
            console.error("Save error:", err);
            alert("Error saving settings: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTestCredentials = async (providerToTest: ProviderOption) => {
        setTesting(true);
        setTestResult(null);

        try {
            const res = await fetch("/api/admin/shipping/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: providerToTest,
                    shiprocketEmail,
                    shiprocketPassword,
                    delhiveryToken,
                    delhiverySandbox,
                }),
            });

            const data = await res.json().catch(() => ({ success: false, error: "API connection failed" }));

            if (res.ok && data.success) {
                setTestResult({ success: true, message: data.message || "Connection successful!" });
            } else {
                setTestResult({ success: false, message: data.error || "Connection failed. Please check credentials." });
            }
        } catch (err: any) {
            console.error("Test credentials error:", err);
            setTestResult({ success: false, message: err.message || "An unexpected error occurred." });
        } finally {
            setTesting(false);
        }
    };

    const handleAddOrEditGroup = () => {
        if (!groupName.trim()) {
            alert("Please enter a group name.");
            return;
        }
        if (groupStates.length === 0) {
            alert("Please select at least one state.");
            return;
        }

        if (editingGroupId) {
            // Update
            setStateGroups(current =>
                current.map(g => g.id === editingGroupId ? { ...g, name: groupName, charge: Number(groupCharge), states: groupStates } : g)
            );
        } else {
            // Create
            const newGroup: StateGroup = {
                id: "group-" + Math.random().toString(36).substring(2, 9),
                name: groupName,
                charge: Number(groupCharge),
                states: groupStates
            };
            setStateGroups(current => [...current, newGroup]);
        }

        // Reset
        setShowGroupForm(false);
        setEditingGroupId(null);
        setGroupName("");
        setGroupCharge(50);
        setGroupStates([]);
    };

    const handleStartEditGroup = (group: StateGroup) => {
        setEditingGroupId(group.id);
        setGroupName(group.name);
        setGroupCharge(group.charge);
        setGroupStates(group.states);
        setShowGroupForm(true);
    };

    const handleDeleteGroup = (id: string) => {
        if (confirm("Are you sure you want to delete this state group?")) {
            setStateGroups(current => current.filter(g => g.id !== id));
        }
    };

    const handleStateCheckboxChange = (stateName: string) => {
        setGroupStates(current =>
            current.includes(stateName)
                ? current.filter(s => s !== stateName)
                : [...current, stateName]
        );
    };

    // Calculate which states are already allocated to other groups
    const getAllocatedStates = (excludeGroupId: string | null) => {
        const allocated: string[] = [];
        stateGroups.forEach(g => {
            if (g.id !== excludeGroupId) {
                allocated.push(...g.states);
            }
        });
        return allocated;
    };

    const allocatedStates = getAllocatedStates(editingGroupId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-slate-500 font-medium">Loading shipping settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-8 pb-16">
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900 text-white rounded-xl shadow-2xl animate-fade-in">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium">{toast}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                    <Truck className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Shipping & Tax Configurations</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage default delivery rates, state zones, COD advance payments, and storefront taxes.</p>
                </div>
            </div>

            {/* Section 1: Fulfillment Providers Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900">Select Shipping Fulfillment</h2>
                    <span className="text-xs text-gray-500 font-medium">Select which logistics service receives dispatches</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-gray-200">
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Service Name</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Manual */}
                            <tr className={`hover:bg-slate-50/50 transition-colors ${provider === "manual" ? "bg-indigo-50/10" : ""}`}>
                                <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">Manual Shipping</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    No API connection. Manually add tracking URLs to orders from SpeedPost, DTDC, or other local providers.
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {provider === "manual" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        type="button"
                                        onClick={() => setEditModalProvider("manual")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                </td>
                            </tr>

                            {/* Shiprocket */}
                            <tr className={`hover:bg-slate-50/50 transition-colors ${provider === "shiprocket" ? "bg-indigo-50/10" : ""}`}>
                                <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">Shiprocket</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    Automated multi-carrier logistics. Sync orders, generate waybills, schedule pickups, and push live tracking.
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {provider === "shiprocket" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        type="button"
                                        onClick={() => setEditModalProvider("shiprocket")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                </td>
                            </tr>

                            {/* Delhivery */}
                            <tr className={`hover:bg-slate-50/50 transition-colors ${provider === "delhivery" ? "bg-indigo-50/10" : ""}`}>
                                <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">Delhivery</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    Direct integration with Delhivery enterprise account for dispatches, bookings, and warehouse serviceability.
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {provider === "delhivery" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        type="button"
                                        onClick={() => setEditModalProvider("delhivery")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 2: General & COD & Tax Configuration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* General Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                        <Settings className="h-4 w-4 text-indigo-600" />
                        General Shipping Rates
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Default Shipping Charge
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <IndianRupee className="h-3.5 w-3.5" />
                            </span>
                            <input
                                type="number"
                                min="0"
                                value={defaultFee}
                                onChange={(e) => setDefaultFee(Number(e.target.value))}
                                className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Free Shipping Threshold
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <IndianRupee className="h-3.5 w-3.5" />
                            </span>
                            <input
                                type="number"
                                min="0"
                                value={freeThreshold}
                                onChange={(e) => setFreeThreshold(Number(e.target.value))}
                                className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Orders above this subtotal amount get free delivery.</p>
                    </div>
                </div>

                {/* COD Charges & Advance */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                        <IndianRupee className="h-4 w-4 text-emerald-600" />
                        Cash on Delivery (COD)
                    </h3>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            COD Surcharge Fee
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <IndianRupee className="h-3.5 w-3.5" />
                            </span>
                            <input
                                type="number"
                                min="0"
                                value={codFee}
                                onChange={(e) => setCodFee(Number(e.target.value))}
                                className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Additional charge applied for selecting COD payment.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            COD Advance Payment Type
                        </label>
                        <select
                            value={codAdvanceType}
                            onChange={(e) => setCodAdvanceType(e.target.value as any)}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                        >
                            <option value="none">None (Full COD)</option>
                            <option value="flat">Flat Amount</option>
                            <option value="percent">Percentage of Total</option>
                        </select>
                    </div>

                    {codAdvanceType !== "none" && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                Advance Value Required
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                    {codAdvanceType === "flat" ? (
                                        <IndianRupee className="h-3.5 w-3.5" />
                                    ) : (
                                        <Percent className="h-3.5 w-3.5" />
                                    )}
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    value={codAdvanceValue}
                                    onChange={(e) => setCodAdvanceValue(Number(e.target.value))}
                                    className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                />
                            </div>
                            <p className="text-[11px] text-indigo-600 font-medium mt-1">
                                Customer must pay {codAdvanceType === "flat" ? `₹${codAdvanceValue}` : `${codAdvanceValue}%`} online first.
                            </p>
                        </div>
                    )}
                </div>

                {/* Tax Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                        <Tags className="h-4 w-4 text-indigo-600" />
                        Tax Configurations
                    </h3>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Tax Display Mode
                        </label>
                        <select
                            value={taxMode}
                            onChange={(e) => setTaxMode(e.target.value as any)}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                        >
                            <option value="none">None (No Tax Added/Calculated)</option>
                            <option value="add_extra">Add Extra Tax (Adds % on top of total)</option>
                            <option value="included">Included in Price (Display breakdown only)</option>
                        </select>
                    </div>

                    {taxMode !== "none" && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                Tax Rate (%)
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                    <Percent className="h-3.5 w-3.5" />
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                        <p className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                            <Info className="h-3 w-3 text-indigo-600" />
                            Tax Mode Tip:
                        </p>
                        {taxMode === "none" && "No tax configurations will be displayed on the checkout page."}
                        {taxMode === "add_extra" && `A surcharge of ${taxRate}% GST will be added to the subtotal amount at checkout.`}
                        {taxMode === "included" && `Checkout will show the breakdown: "${taxRate}% GST Included" without changing the total price.`}
                    </div>
                </div>
            </div>

            {/* Section 3: State-based Shipping Groups Builder */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Custom State-based Shipping Charges</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Define custom flat-rate shipping for specific groupings of Indian states.</p>
                    </div>
                    {!showGroupForm && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingGroupId(null);
                                setGroupName("");
                                setGroupCharge(50);
                                setGroupStates([]);
                                setShowGroupForm(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add State Group
                        </button>
                    )}
                </div>

                {/* State Group Form */}
                {showGroupForm && (
                    <div className="p-5 bg-slate-50/50 border border-slate-200/80 rounded-xl space-y-5 animate-fade-in">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Tags className="h-4 w-4 text-indigo-600" />
                            {editingGroupId ? "Modify State Group" : "Create New State Group"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. South Zone, Special Delivery"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                    Shipping Charge (Flat Rate)
                                </label>
                                <div className="relative rounded-lg shadow-sm bg-white">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                        <IndianRupee className="h-3.5 w-3.5" />
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={groupCharge}
                                        onChange={(e) => setGroupCharge(Number(e.target.value))}
                                        className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* States selector grid */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                                Select States & UTs to Include in Group ({groupStates.length} selected)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 bg-white border border-slate-100 p-4.5 rounded-xl max-h-[260px] overflow-y-auto shadow-inner">
                                {ALL_INDIAN_STATES.map((stateName) => {
                                    const isAllocated = allocatedStates.includes(stateName);
                                    const isChecked = groupStates.includes(stateName);

                                    return (
                                        <div 
                                            key={stateName} 
                                            onClick={() => {
                                                if (!isAllocated) handleStateCheckboxChange(stateName);
                                            }}
                                            className={`flex items-center gap-2.5 px-3 py-2 border rounded-lg cursor-pointer transition-all select-none ${
                                                isChecked 
                                                    ? "bg-indigo-50 border-indigo-200 text-indigo-900" 
                                                    : isAllocated 
                                                        ? "bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed opacity-50" 
                                                        : "border-gray-150 hover:border-gray-300 hover:bg-slate-50/50"
                                            }`}
                                        >
                                            {isChecked ? (
                                                <CheckSquare className="h-4.5 w-4.5 text-indigo-600 flex-shrink-0" />
                                            ) : (
                                                <Square className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                                            )}
                                            <span className="text-xs font-medium truncate">{stateName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">Allocated states are disabled to prevent overlapping rules.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleAddOrEditGroup}
                                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                            >
                                {editingGroupId ? "Update Group" : "Add Group"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowGroupForm(false);
                                    setEditingGroupId(null);
                                    setGroupName("");
                                    setGroupCharge(50);
                                    setGroupStates([]);
                                }}
                                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* State Groups List */}
                <div className="space-y-3">
                    {stateGroups.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                            No custom state-based charges created yet. General flat-rate applies to all locations.
                        </div>
                    ) : (
                        stateGroups.map((group) => (
                            <div key={group.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all shadow-sm">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900">{group.name}</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            ₹{group.charge} shipping
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {group.states.join(", ")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleStartEditGroup(group)}
                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save All Configurations
                </button>
            </div>

            {/* Provider Modal Overlay */}
            {editModalProvider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Settings className="h-4 w-4 text-indigo-600" />
                                Configure {editModalProvider === "manual" ? "Manual Shipping" : editModalProvider === "shiprocket" ? "Shiprocket" : "Delhivery"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditModalProvider(null);
                                    setTestResult(null);
                                }}
                                className="p-1 text-slate-400 hover:text-gray-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Enable Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                                <div>
                                    <span className="text-sm font-bold text-gray-900">Fulfillment Status</span>
                                    <p className="text-xs text-slate-500 mt-0.5">Toggle to set this as the active fulfillment provider.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProvider(editModalProvider);
                                    }}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        provider === editModalProvider ? "bg-indigo-600" : "bg-slate-200"
                                    }`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        provider === editModalProvider ? "translate-x-5" : "translate-x-0"
                                    }`} />
                                </button>
                            </div>

                            {/* Shiprocket Form Fields */}
                            {editModalProvider === "shiprocket" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                            API Login Email
                                        </label>
                                        <input
                                            type="email"
                                            value={shiprocketEmail}
                                            onChange={(e) => setShiprocketEmail(e.target.value)}
                                            placeholder="your-email@shiprocket.com"
                                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                            API Login Password
                                        </label>
                                        <input
                                            type="password"
                                            value={shiprocketPassword}
                                            onChange={(e) => setShiprocketPassword(e.target.value)}
                                            placeholder={shiprocketPassword ? "••••••••••••" : "Enter Password"}
                                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Delhivery Form Fields */}
                            {editModalProvider === "delhivery" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                            API Token
                                        </label>
                                        <input
                                            type="password"
                                            value={delhiveryToken}
                                            onChange={(e) => setDelhiveryToken(e.target.value)}
                                            placeholder={delhiveryToken ? "••••••••••••" : "Enter Delhivery API Token"}
                                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                        <input
                                            id="sandbox-modal"
                                            type="checkbox"
                                            checked={delhiverySandbox}
                                            onChange={(e) => setDelhiverySandbox(e.target.checked)}
                                            className="h-4.5 w-4.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor="sandbox-modal" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                                            Enable Sandbox / Development Staging Environment
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Test Result Display */}
                            {editModalProvider !== "manual" && (
                                <div className="pt-2 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Integration</span>
                                        <button
                                            type="button"
                                            disabled={testing}
                                            onClick={() => handleTestCredentials(editModalProvider)}
                                            className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-lg transition-colors border border-slate-250 flex items-center gap-1.5"
                                        >
                                            {testing && <Loader2 className="h-3 w-3 animate-spin" />}
                                            Validate Keys
                                        </button>
                                    </div>

                                    {testResult && (
                                        <div className={`flex items-start gap-3 p-4.5 rounded-xl border ${
                                            testResult.success 
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                                                : "bg-rose-50 border-rose-100 text-rose-800"
                                        }`}>
                                            {testResult.success ? (
                                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <XCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="text-xs">
                                                <p className="font-bold">{testResult.success ? "Connection Verified" : "Connection Failed"}</p>
                                                <p className="mt-1 text-slate-650 font-medium">{testResult.message}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditModalProvider(null);
                                    setTestResult(null);
                                }}
                                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                            >
                                Close Modal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleSave();
                                    setEditModalProvider(null);
                                    setTestResult(null);
                                }}
                                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
                            >
                                Save & Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
