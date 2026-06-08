import { fetchTemplateByKey } from "@/app/actions/notifications";
import TemplateEditorClient from "./TemplateEditorClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
    params: {
        templateKey: string;
    };
}

export default async function EditTemplatePage({ params }: PageProps) {
    const template = await fetchTemplateByKey(params.templateKey);
    
    if (!template) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto">
            <TemplateEditorClient template={template} />
        </div>
    );
}
