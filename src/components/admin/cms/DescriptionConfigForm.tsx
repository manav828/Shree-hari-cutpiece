"use client";

import SiteConfigFormSection, { SiteConfigField } from "@/components/admin/cms/SiteConfigFormSection";

type Props = {
    fields: SiteConfigField[];
    values: Record<string, string>;
    uploadingKey: string | null;
    onChange: (key: string, value: string) => void;
    onUpload: (field: SiteConfigField, file: File) => Promise<void>;
};

export default function DescriptionConfigForm(props: Props) {
    return (
        <SiteConfigFormSection
            title="Description Configuration"
            subtitle="Manage why-choose-us section copy, points, stats, and images."
            {...props}
        />
    );
}
