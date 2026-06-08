"use client";

import { useRouter } from "next/navigation";
import TemplateEditor from "@/components/admin/notifications/TemplateEditor";
import { NotificationTemplate } from "@/app/actions/notifications";

export default function TemplateEditorClient({ template }: { template: NotificationTemplate }) {
    const router = useRouter();
    
    return (
        <TemplateEditor 
            template={template} 
            onClose={() => router.push("/admin/notifications-templates")}
            onSave={() => router.push("/admin/notifications-templates")}
        />
    );
}
