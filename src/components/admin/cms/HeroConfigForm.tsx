"use client";

import SiteConfigFormSection, { SiteConfigField } from "@/components/admin/cms/SiteConfigFormSection";

type Props = {
    fields: SiteConfigField[];
    values: Record<string, string>;
    uploadingKey: string | null;
    onChange: (key: string, value: string) => void;
    onUpload: (field: SiteConfigField, file: File) => Promise<void>;
};

export default function HeroConfigForm(props: Props) {
    return (
        <SiteConfigFormSection
            title="Hero Configuration"
            subtitle="Update hero text, CTA buttons, trust stats, and hero images."
            {...props}
        />
    );
}
