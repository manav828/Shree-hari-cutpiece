"use client";

import SiteConfigFormSection, { SiteConfigField } from "@/components/admin/cms/SiteConfigFormSection";

type Props = {
    fields: SiteConfigField[];
    values: Record<string, string>;
    uploadingKey: string | null;
    onChange: (key: string, value: string) => void;
    onUpload: (field: SiteConfigField, file: File) => Promise<void>;
};

export default function StoreConfigForm(props: Props) {
    return (
        <SiteConfigFormSection
            title="Store Information"
            subtitle="Update address, timing, contact details, and map links."
            {...props}
        />
    );
}
