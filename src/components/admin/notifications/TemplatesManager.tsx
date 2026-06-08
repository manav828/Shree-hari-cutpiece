"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageSquare, Edit3, Settings, Loader2 } from "lucide-react";
import { NotificationTemplate, updateNotificationConfig, testRegistrationNotification } from "@/app/actions/notifications";
import { showToast } from "@/lib/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";
import { Input } from "@/components/admin/ui/Input";

interface TemplatesManagerProps {
    initialTemplates: NotificationTemplate[];
    initialConfig: Record<string, string>;
}

export default function TemplatesManager({ initialTemplates, initialConfig }: TemplatesManagerProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"templates" | "providers">("templates");
    const [templates] = useState<NotificationTemplate[]>(initialTemplates);
    const [config, setConfig] = useState<Record<string, string>>(initialConfig);
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    // Registration testing states
    const [testRegName, setTestRegName] = useState("Manav Patel");
    const [testRegEmail, setTestRegEmail] = useState("");
    const [testRegPhone, setTestRegPhone] = useState("");
    const [isTestingReg, setIsTestingReg] = useState(false);


    // Filter templates by type
    const emailTemplates = templates.filter(t => t.type === "email");
    const whatsappTemplates = templates.filter(t => t.type === "whatsapp");

    // Toggle provider status
    const handleToggleProvider = async (providerId: "resend" | "smtp" | "twilio" | "mock", type: "email" | "whatsapp") => {
        setLoadingProvider(providerId);

        const configKey = type === "email" ? "notification_email_provider" : "notification_whatsapp_provider";
        const currentActive = config[configKey];
        const newActive = currentActive === providerId ? "disabled" : providerId;

        const updatedConfig = {
            ...config,
            [configKey]: newActive
        };

        const res = await updateNotificationConfig({ [configKey]: newActive });
        setLoadingProvider(null);

        if (res.success) {
            setConfig(updatedConfig);
            showToast(`Successfully updated ${type === "email" ? "Email" : "WhatsApp"} sending configuration!`, "success");
        } else {
            showToast(`Failed to toggle provider: ${res.error}`, "error");
        }
    };

    // Test registration notification trigger
    const handleTestRegistration = async () => {
        if (!testRegEmail && !testRegPhone) {
            showToast("Please provide either a test email or test phone number.", "error");
            return;
        }

        setIsTestingReg(true);

        const res = await testRegistrationNotification(testRegEmail, testRegPhone, testRegName);
        setIsTestingReg(false);

        if (res.success) {
            let msg = "Test registration notifications triggered successfully! ";
            if (res.emailSent) msg += "Email Sent ✅ ";
            if (res.whatsappSent) msg += "WhatsApp Sent/Mocked ✅ ";
            if (!res.emailSent && !res.whatsappSent) msg += "(Note: Make sure your email/WhatsApp providers are enabled in Settings)";
            showToast(msg, "success");
        } else {
            showToast(res.errors?.join(", ") || "Failed to trigger test registration.", "error");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50/50">
                <button
                    onClick={() => setActiveTab("templates")}
                    className={`flex items-center gap-2 px-6 py-4 text-[13px] font-semibold border-b-2 transition-all ${
                        activeTab === "templates"
                            ? "border-indigo-600 text-indigo-600 bg-white"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                    <Edit3 className="w-4 h-4" />
                    Manage Notification Templates
                </button>
                <button
                    onClick={() => setActiveTab("providers")}
                    className={`flex items-center gap-2 px-6 py-4 text-[13px] font-semibold border-b-2 transition-all ${
                        activeTab === "providers"
                            ? "border-indigo-600 text-indigo-600 bg-white"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    Providers & Integrations
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
                {/* TAB 1: TEMPLATES LIST */}
                {activeTab === "templates" && (
                    <div className="space-y-6">
                        {/* Email Templates section */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <Mail className="w-4.5 h-4.5 text-indigo-650" />
                                    Email Templates
                                </h2>
                            </div>
                            <Table className="text-sm" wrapperClassName="border-0 rounded-none">
                                <TableHeader>
                                    <TableRow className="border-b border-gray-200 bg-gray-50/75 text-left text-gray-500 hover:bg-transparent">
                                        <TableHead>Template Name</TableHead>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead className="text-center">Variables</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {emailTemplates.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{t.name}</TableCell>
                                            <TableCell className="font-mono text-gray-500 text-xs whitespace-nowrap">{t.key}</TableCell>
                                            <TableCell className="text-gray-600 truncate max-w-xs">{t.subject}</TableCell>
                                            <TableCell className="text-center font-medium text-gray-600">{t.variables.length}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => router.push(`/admin/notifications-templates/edit/${t.key}`)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer shadow-sm"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>Edit Template</span>
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                    {/* WhatsApp Templates section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <MessageSquare className="w-4.5 h-4.5 text-emerald-600" />
                                WhatsApp Templates
                            </h2>
                        </div>
                        <Table className="text-sm" wrapperClassName="border-0 rounded-none">
                                <TableHeader>
                                    <TableRow className="border-b border-gray-200 bg-gray-50/75 text-left text-gray-500 hover:bg-transparent">
                                        <TableHead>Template Name</TableHead>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Message Body</TableHead>
                                        <TableHead className="text-center">Variables</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {whatsappTemplates.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{t.name}</TableCell>
                                            <TableCell className="font-mono text-gray-500 text-xs whitespace-nowrap">{t.key}</TableCell>
                                            <TableCell className="text-gray-600 truncate max-w-xs">{t.body}</TableCell>
                                            <TableCell className="text-center font-medium text-gray-600">{t.variables.length}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => router.push(`/admin/notifications-templates/edit/${t.key}`)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 transition-all cursor-pointer shadow-sm"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>Edit Template</span>
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Test Registration Flow Section */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <span>🧪 Test Registration Notification Flow</span>
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Simulate a new user registration to test your custom email and WhatsApp templates using the settings configured in the Providers tab.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    type="text"
                                    label="Test Customer Name"
                                    value={testRegName}
                                    onChange={(e) => setTestRegName(e.target.value)}
                                    placeholder="e.g. Manav Patel"
                                    className="bg-white font-medium"
                                />
                                <Input
                                    type="email"
                                    label="Test Customer Email"
                                    value={testRegEmail}
                                    onChange={(e) => setTestRegEmail(e.target.value)}
                                    placeholder="e.g. customer@example.com"
                                    className="bg-white font-medium"
                                />
                                <Input
                                    type="tel"
                                    label="Test Customer Phone"
                                    value={testRegPhone}
                                    onChange={(e) => setTestRegPhone(e.target.value)}
                                    placeholder="e.g. +919876543210"
                                    className="bg-white font-medium"
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-150 mt-4">
                                <button
                                    onClick={handleTestRegistration}
                                    disabled={isTestingReg}
                                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg disabled:opacity-70 cursor-pointer shadow-sm"
                                >
                                    {isTestingReg ? "Processing Test..." : "Trigger Registration Test"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: PROVIDERS TABLE */}
                {activeTab === "providers" && (
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Service Providers</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <Table className="text-sm" wrapperClassName="border-0 rounded-none">
                            <TableHeader>
                                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                                    <TableHead className="py-2 pr-4 font-semibold text-gray-700">Service Provider</TableHead>
                                    <TableHead className="py-2 pr-4 font-semibold text-gray-700">Notification Type</TableHead>
                                    <TableHead className="py-2 pr-4 font-semibold text-gray-700">Active Status</TableHead>
                                    <TableHead className="py-2 text-right font-semibold text-gray-700">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100">
                                {/* Resend */}
                                <TableRow className="border-b border-gray-100">
                                    <TableCell className="py-3 pr-4 font-semibold text-gray-900">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">Resend API</span>
                                            <span className="text-xs text-gray-400 font-normal mt-0.5">Send transactional emails using custom domain via API</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            <Mail className="w-3.5 h-3.5" />
                                            Email
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <button
                                            disabled={loadingProvider !== null}
                                            onClick={() => handleToggleProvider("resend", "email")}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                config.notification_email_provider === "resend" ? "bg-indigo-600" : "bg-slate-300"
                                            }`}
                                            aria-label="Toggle Resend Provider"
                                        >
                                            <span
                                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                    config.notification_email_provider === "resend" ? "translate-x-4" : "translate-x-0.5"
                                                }`}
                                            />
                                            {loadingProvider === "resend" && (
                                                <Loader2 className="absolute inset-0 m-auto h-3 w-3 text-white animate-spin" />
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <button
                                            onClick={() => router.push("/admin/notifications-templates/providers/resend")}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-650 hover:border-indigo-200 transition-all cursor-pointer shadow-sm hover:shadow"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                            <span>Configure</span>
                                        </button>
                                    </TableCell>
                                </TableRow>

                                {/* SMTP */}
                                <TableRow className="border-b border-gray-100">
                                    <TableCell className="py-3 pr-4 font-semibold text-gray-900">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">SMTP Server (Gmail/Other)</span>
                                            <span className="text-xs text-gray-400 font-normal mt-0.5">Send free emails using regular SMTP credentials</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            <Mail className="w-3.5 h-3.5" />
                                            Email
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <button
                                            disabled={loadingProvider !== null}
                                            onClick={() => handleToggleProvider("smtp", "email")}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                config.notification_email_provider === "smtp" ? "bg-indigo-600" : "bg-slate-300"
                                            }`}
                                            aria-label="Toggle SMTP Provider"
                                        >
                                            <span
                                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                    config.notification_email_provider === "smtp" ? "translate-x-4" : "translate-x-0.5"
                                                }`}
                                            />
                                            {loadingProvider === "smtp" && (
                                                <Loader2 className="absolute inset-0 m-auto h-3 w-3 text-white animate-spin" />
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <button
                                            onClick={() => router.push("/admin/notifications-templates/providers/smtp")}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-650 hover:border-indigo-200 transition-all cursor-pointer shadow-sm hover:shadow"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                            <span>Configure</span>
                                        </button>
                                    </TableCell>
                                </TableRow>

                                {/* Twilio WhatsApp */}
                                <TableRow className="border-b border-gray-100">
                                    <TableCell className="py-3 pr-4 font-semibold text-gray-900">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">Twilio WhatsApp</span>
                                            <span className="text-xs text-gray-400 font-normal mt-0.5">Send WhatsApp messages using Twilio API</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            WhatsApp
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <button
                                            disabled={loadingProvider !== null}
                                            onClick={() => handleToggleProvider("twilio", "whatsapp")}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-450 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                config.notification_whatsapp_provider === "twilio" ? "bg-emerald-500" : "bg-slate-300"
                                            }`}
                                            aria-label="Toggle Twilio WhatsApp Provider"
                                        >
                                            <span
                                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                    config.notification_whatsapp_provider === "twilio" ? "translate-x-4" : "translate-x-0.5"
                                                }`}
                                            />
                                            {loadingProvider === "twilio" && (
                                                <Loader2 className="absolute inset-0 m-auto h-3 w-3 text-white animate-spin" />
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <button
                                            onClick={() => router.push("/admin/notifications-templates/providers/twilio")}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 transition-all cursor-pointer shadow-sm hover:shadow"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                            <span>Configure</span>
                                        </button>
                                    </TableCell>
                                </TableRow>

                                {/* Mock Console Log */}
                                <TableRow className="border-b border-gray-100">
                                    <TableCell className="py-3 pr-4 font-semibold text-gray-900">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">Mock Console Log</span>
                                            <span className="text-xs text-gray-400 font-normal mt-0.5">Dummy logging in Node console (useful for development)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            WhatsApp
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <button
                                            disabled={loadingProvider !== null}
                                            onClick={() => handleToggleProvider("mock", "whatsapp")}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-450 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                config.notification_whatsapp_provider === "mock" ? "bg-emerald-500" : "bg-slate-300"
                                            }`}
                                            aria-label="Toggle Mock Console Log Provider"
                                        >
                                            <span
                                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                    config.notification_whatsapp_provider === "mock" ? "translate-x-4" : "translate-x-0.5"
                                                }`}
                                            />
                                            {loadingProvider === "mock" && (
                                                <Loader2 className="absolute inset-0 m-auto h-3 w-3 text-white animate-spin" />
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <button
                                            onClick={() => router.push("/admin/notifications-templates/providers/mock")}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 transition-all cursor-pointer shadow-sm hover:shadow"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                            <span>Configure</span>
                                        </button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
