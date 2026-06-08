"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageSquare, ArrowLeft, Save, Play, Check, AlertCircle, HelpCircle } from "lucide-react";
import { updateNotificationConfig, testProviderConnection } from "@/app/actions/notifications";
import { Input } from "@/components/admin/ui/Input";

interface ProviderConfiguratorProps {
    provider: string;
    initialConfig: Record<string, string>;
}

export default function ProviderConfigurator({ provider, initialConfig }: ProviderConfiguratorProps) {
    const router = useRouter();
    const [config, setConfig] = useState<Record<string, string>>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [testRecipient, setTestRecipient] = useState("");
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Form inputs state based on provider
    const [resendKey, setResendKey] = useState(config.notification_resend_api_key || "");
    const [resendFrom, setResendFrom] = useState(config.notification_resend_from || "");

    const [smtpHost, setSmtpHost] = useState(config.notification_smtp_host || "");
    const [smtpPort, setSmtpPort] = useState(config.notification_smtp_port || "587");
    const [smtpSecure, setSmtpSecure] = useState(config.notification_smtp_secure === "true");
    const [smtpUser, setSmtpUser] = useState(config.notification_smtp_user || "");
    const [smtpPass, setSmtpPass] = useState(config.notification_smtp_pass || "");
    const [smtpFrom, setSmtpFrom] = useState(config.notification_smtp_from || "");

    const [twilioSid, setTwilioSid] = useState(config.notification_twilio_sid || "");
    const [twilioToken, setTwilioToken] = useState(config.notification_twilio_auth_token || "");
    const [twilioFrom, setTwilioFrom] = useState(config.notification_twilio_from || "");

    // Validation
    const providerNameMap: Record<string, string> = {
        resend: "Resend API",
        smtp: "SMTP Server",
        twilio: "Twilio WhatsApp",
        mock: "Mock Console Log"
    };

    const providerName = providerNameMap[provider] || "Unknown Provider";

    // Gather current values to save/test
    const getCurrentConfigValues = (): Record<string, string> => {
        if (provider === "resend") {
            return {
                notification_resend_api_key: resendKey,
                notification_resend_from: resendFrom
            };
        } else if (provider === "smtp") {
            return {
                notification_smtp_host: smtpHost,
                notification_smtp_port: smtpPort,
                notification_smtp_secure: String(smtpSecure),
                notification_smtp_user: smtpUser,
                notification_smtp_pass: smtpPass,
                notification_smtp_from: smtpFrom
            };
        } else if (provider === "twilio") {
            return {
                notification_twilio_sid: twilioSid,
                notification_twilio_auth_token: twilioToken,
                notification_twilio_from: twilioFrom
            };
        }
        return {};
    };

    // Save configurations
    const handleSave = async () => {
        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const currentValues = getCurrentConfigValues();
        const res = await updateNotificationConfig(currentValues);
        setIsSaving(false);

        if (res.success) {
            setConfig({ ...config, ...currentValues });
            setSuccessMessage("Configuration saved successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            setErrorMessage(`Failed to save configuration: ${res.error}`);
        }
    };

    // Test send diagnostic trigger
    const handleTestConnection = async () => {
        if (!testRecipient) {
            setTestResult({ success: false, message: "Please enter a test recipient address/phone." });
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        const currentValues = getCurrentConfigValues();
        // Temporarily merge current inputs with full settings config mapping
        const fullTestConfig = { ...config, ...currentValues };

        const res = await testProviderConnection(
            provider as "resend" | "smtp" | "twilio",
            testRecipient,
            fullTestConfig
        );
        
        setIsTesting(false);

        if (res.success) {
            setTestResult({ success: true, message: "Test notification sent successfully! Check your inbox/device." });
        } else {
            setTestResult({ success: false, message: res.error || "Failed to send test notification." });
        }
    };

    return (
        <div className="space-y-6">
            {/* Back Header Bar */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push("/admin/notifications-templates")}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notification Providers</span>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">Configure {providerName}</h2>
                </div>
            </div>

            {/* Split Screen Columns */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* LEFT COLUMN: Input Form */}
                <div className="w-full lg:w-3/5 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-1.5">
                            {provider === "twilio" || provider === "mock" ? (
                                <MessageSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                                <Mail className="w-4 h-4 text-indigo-600" />
                            )}
                            Credentials Configuration
                        </h3>
                    </div>

                    {/* Alert Banners */}
                    {successMessage && (
                        <div className="flex items-center gap-2 text-[12px] bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg font-medium animate-fadeIn">
                            <Check className="w-4 h-4" />
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="flex items-center gap-2 text-[12px] bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg font-medium animate-fadeIn">
                            <AlertCircle className="w-4 h-4" />
                            {errorMessage}
                        </div>
                    )}

                    {/* DYNAMIC FORMS BASED ON PROVIDER */}

                    {/* 1. RESEND FORM */}
                    {provider === "resend" && (
                        <div className="space-y-4">
                            <Input
                                type="password"
                                label="Resend API Key"
                                value={resendKey}
                                onChange={(e) => setResendKey(e.target.value)}
                                placeholder="re_xxxxxxxxxxxxxxxx"
                                className="font-mono"
                            />
                            <div className="space-y-1.5">
                                <Input
                                    type="text"
                                    label="Sender Email Address (From Email)"
                                    value={resendFrom}
                                    onChange={(e) => setResendFrom(e.target.value)}
                                    placeholder="Shree Hari <orders@doneone.in>"
                                    className="font-medium"
                                />
                                <span className="text-[10px] text-slate-400 font-medium block">Format: &quot;Display Name &lt;email@domain.com&gt;&quot;</span>
                            </div>
                        </div>
                    )}

                    {/* 2. SMTP FORM */}
                    {provider === "smtp" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    type="text"
                                    label="SMTP Host Server"
                                    value={smtpHost}
                                    onChange={(e) => setSmtpHost(e.target.value)}
                                    placeholder="smtp.gmail.com"
                                    wrapperClassName="md:col-span-2"
                                    className="font-medium"
                                />
                                <Input
                                    type="text"
                                    label="SMTP Port"
                                    value={smtpPort}
                                    onChange={(e) => setSmtpPort(e.target.value)}
                                    placeholder="587"
                                    className="font-medium"
                                />
                            </div>
                            
                             <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">SSL/TLS Secure Connection</span>
                                    <span className="text-[10px] text-slate-400">Enable direct SSL/TLS (usually port 465). Keep disabled for STARTTLS (usually port 587).</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={smtpSecure}
                                    onChange={(e) => setSmtpSecure(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    type="text"
                                    label="SMTP Username"
                                    value={smtpUser}
                                    onChange={(e) => setSmtpUser(e.target.value)}
                                    placeholder="yourname@gmail.com"
                                    className="font-medium"
                                />
                                <Input
                                    type="password"
                                    label="SMTP Password"
                                    value={smtpPass}
                                    onChange={(e) => setSmtpPass(e.target.value)}
                                    placeholder="Enter App Password"
                                    className="font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Input
                                    type="text"
                                    label="Sender Email Address (From Email)"
                                    value={smtpFrom}
                                    onChange={(e) => setSmtpFrom(e.target.value)}
                                    placeholder="Shree Hari <shop@gmail.com>"
                                    className="font-medium"
                                />
                                <span className="text-[10px] text-slate-400 font-medium block">Format: &quot;Display Name &lt;email@domain.com&gt;&quot;</span>
                            </div>
                        </div>
                    )}

                    {/* 3. TWILIO FORM */}
                    {provider === "twilio" && (
                        <div className="space-y-4">
                            <Input
                                type="text"
                                label="Twilio Account SID"
                                value={twilioSid}
                                onChange={(e) => setTwilioSid(e.target.value)}
                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="font-mono"
                            />
                            <Input
                                type="password"
                                label="Twilio Auth Token"
                                value={twilioToken}
                                onChange={(e) => setTwilioToken(e.target.value)}
                                placeholder="Enter Auth Token"
                                className="font-mono"
                            />
                            <div className="space-y-1.5">
                                <Input
                                    type="text"
                                    label="Twilio WhatsApp Sandbox/From Number"
                                    value={twilioFrom}
                                    onChange={(e) => setTwilioFrom(e.target.value)}
                                    placeholder="whatsapp:+14155238886"
                                    className="font-medium"
                                />
                                <span className="text-[10px] text-slate-400 font-medium block">Must start with &quot;whatsapp:&quot; followed by international format.</span>
                            </div>
                        </div>
                    )}

                    {/* 4. MOCK MOCK FORM */}
                    {provider === "mock" && (
                        <div className="p-5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                            <span className="text-xs font-bold text-slate-700 block">Development Mock Transport</span>
                            <p className="text-xs text-slate-500 leading-normal">
                                This provider prints all WhatsApp message payloads to the Node.js server console log. It is 100% free and requires zero setup or API keys.
                            </p>
                            <p className="text-xs text-slate-400 italic">
                                Ideal for local debugging and development order checks.
                            </p>
                        </div>
                    )}

                    {/* Actions Panel */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                             onClick={() => router.push("/admin/notifications-templates")}
                            className="px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        {provider !== "mock" && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? "Saving..." : "Save Settings"}
                            </button>
                        )}
                    </div>

                    {/* CONNECTION DIAGNOSTIC PANEL */}
                    {provider !== "mock" && (
                        <div className="pt-6 border-t border-slate-200 mt-6 space-y-4 bg-slate-50/30 p-4 rounded-xl border border-slate-150">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <Play className="w-3.5 h-3.5 text-indigo-600" />
                                    Diagnostic Connection Test
                                </h4>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Send a quick test message using the inputs configured above without saving them first.</span>
                            </div>

                            {testResult && (
                                <div className={`flex items-center gap-2 text-xs border p-3 rounded-lg font-medium animate-fadeIn ${
                                    testResult.success
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : "bg-red-50 border-red-200 text-red-700"
                                }`}>
                                    {testResult.success ? (
                                        <Check className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    )}
                                    {testResult.message}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    type={provider === "twilio" ? "tel" : "email"}
                                    value={testRecipient}
                                    onChange={(e) => setTestRecipient(e.target.value)}
                                    placeholder={provider === "twilio" ? "+919876543210 (Test WhatsApp)" : "test@email.com (Test Email)"}
                                    wrapperClassName="flex-1"
                                    className="bg-white"
                                />
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer"
                                >
                                    {isTesting ? "Testing..." : "Send Test Message"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Visual setup tutorials */}
                <div className="w-full lg:w-2/5 bg-slate-900 rounded-xl text-slate-100 p-6 flex flex-col justify-between self-start shadow-sm border border-slate-800">
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                            <HelpCircle className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-sm font-bold tracking-tight">Step-by-Step Setup Guide</h3>
                        </div>

                        {/* RESEND GUIDE */}
                        {provider === "resend" && (
                            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                                <p><strong>Resend</strong> is a modern developer-focused email service provider with a generous free tier.</p>
                                
                                <ol className="list-decimal list-inside space-y-3">
                                    <li>
                                        Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-semibold">resend.com</a> and sign up for a free account.
                                    </li>
                                    <li>
                                        Once logged in, click on **API Keys** in the left sidebar, click **Create API Key**, and copy the generated key (begins with `re_`). Paste it into the form.
                                    </li>
                                    <li>
                                        To send email from your custom GoDaddy domain:
                                        <ul className="list-disc list-inside pl-4 mt-1.5 space-y-1">
                                            <li>Go to **Domains** in Resend and click **Add Domain**.</li>
                                            <li>Enter `doneone.in` (your domain) and select AP-South or US region.</li>
                                            <li>Resend will show 3 DNS records (TXT/CNAME/MX).</li>
                                        </ul>
                                    </li>
                                    <li>
                                        Open **GoDaddy DNS Management** for `doneone.in` and add those DNS records.
                                    </li>
                                    <li>
                                        Click **Verify** in Resend. Once checked, you can change your `From Email` to `Shree Hari &lt;orders@doneone.in&gt;`.
                                    </li>
                                </ol>
                            </div>
                        )}

                        {/* SMTP GUIDE */}
                        {provider === "smtp" && (
                            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                                <p>Using an SMTP mail server is completely free if you connect it to your personal Gmail or web hosting email address.</p>
                                
                                <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-lg space-y-1">
                                    <span className="font-bold text-slate-100 block">Recommended (Gmail SMTP):</span>
                                    <span className="text-slate-400 block font-semibold">Host: <span className="font-mono text-white text-[11px]">smtp.gmail.com</span></span>
                                    <span className="text-slate-400 block font-semibold">Port: <span className="font-mono text-white text-[11px]">587</span></span>
                                    <span className="text-slate-400 block font-semibold">Secure: <span className="font-mono text-white text-[11px]">Disabled / SSL: False (Use StartTLS)</span></span>
                                </div>

                                <ol className="list-decimal list-inside space-y-3">
                                    <li>
                                        Go to your **[Google Account Security settings](https://myaccount.google.com/security)**.
                                    </li>
                                    <li>
                                        Enable **2-Step Verification** (required by Google to connect custom apps).
                                    </li>
                                    <li>
                                        Once 2-Step verification is active, click on it, scroll to the bottom, and click **App Passwords**.
                                    </li>
                                    <li>
                                        Type an app name (e.g. `Shree Hari Store`), and click **Create**.
                                    </li>
                                    <li>
                                        Google will show a 16-character code (e.g. `abcd efgh ijkl mnop`). **Copy this code** and paste it into the **SMTP Password** field.
                                    </li>
                                    <li>
                                        Enter your Gmail address as both the **SMTP Username** and the **Sender Email (From Email)**.
                                    </li>
                                </ol>
                            </div>
                        )}

                        {/* TWILIO GUIDE */}
                        {provider === "twilio" && (
                            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                                <p><strong>Twilio</strong> lets you send automated WhatsApp notifications to customer phones. You can test for free using their Sandbox.</p>
                                
                                <ol className="list-decimal list-inside space-y-3">
                                    <li>
                                        Sign up for a free account at **[twilio.com](https://www.twilio.com/)**.
                                    </li>
                                    <li>
                                        In your Twilio Console home page, look at the **Project Info** section. Copy your **Account SID** and **Auth Token** and paste them into the form on the left.
                                    </li>
                                    <li>
                                        In the Twilio sidebar, search or navigate to **Messaging** &rarr; **Try it out** &rarr; **Send a WhatsApp Message**.
                                    </li>
                                    <li>
                                        You will see a free testing sandbox number (e.g. `whatsapp:+14155238886`). Copy it and paste it into **Twilio WhatsApp Number**.
                                    </li>
                                    <li>
                                        To receive test messages on your phone, you must first send a join code (e.g. `join sandbox-name`) to that sandbox number using your phone.
                                    </li>
                                </ol>
                            </div>
                        )}

                        {/* MOCK GUIDE */}
                        {provider === "mock" && (
                            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                                <p>The Mock provider simulates WhatsApp messaging without calling any external APIs.</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li><strong>Cost:</strong> 100% Free forever.</li>
                                    <li><strong>Usage:</strong> When an order event triggers, a formatted terminal box showing the text message will output directly into your server console logs.</li>
                                    <li><strong>Ideal for:</strong> Local development testing without configuring a Twilio account.</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Brand Footer */}
                    <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-medium mt-6 text-center">
                        Shree Hari Cutpiece • Notification Engine Config
                    </div>
                </div>
            </div>
        </div>
    );
}
