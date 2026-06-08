import { fetchNotificationTemplates, fetchNotificationConfig } from "@/app/actions/notifications";
import TemplatesManager from "@/components/admin/notifications/TemplatesManager";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationTemplatesPage() {
    const templates = await fetchNotificationTemplates();
    const config = await fetchNotificationConfig();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notification Settings</h1>
                        <p className="text-xs text-slate-500 font-medium">Configure transaction email and WhatsApp templates for customer notifications</p>
                    </div>
                </div>
            </div>

            {/* Main Manager Dashboard */}
            <TemplatesManager initialTemplates={templates} initialConfig={config} />
        </div>
    );
}
