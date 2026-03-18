"use client";

export type SiteConfigFieldType = "text" | "textarea" | "number" | "url" | "image";

export type SiteConfigField = {
    key: string;
    label: string;
    type: SiteConfigFieldType;
    required?: boolean;
    helpText?: string;
    group: "hero" | "description" | "store" | "stats";
};

type Props = {
    title: string;
    subtitle: string;
    fields: SiteConfigField[];
    values: Record<string, string>;
    uploadingKey: string | null;
    onChange: (key: string, value: string) => void;
    onUpload: (field: SiteConfigField, file: File) => Promise<void>;
};

export default function SiteConfigFormSection({
    title,
    subtitle,
    fields,
    values,
    uploadingKey,
    onChange,
    onUpload,
}: Props) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>

            <div className="p-6 space-y-5">
                {fields.map((field) => {
                    const value = values[field.key] ?? "";

                    if (field.type === "image") {
                        return (
                            <div key={field.key} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {field.label}
                                    {field.required ? <span className="text-red-500"> *</span> : null}
                                </label>
                                {field.helpText ? (
                                    <p className="text-xs text-gray-500">{field.helpText}</p>
                                ) : null}

                                {value ? (
                                    <img
                                        src={value}
                                        alt={field.label}
                                        className="w-full max-w-sm h-40 object-cover rounded-lg border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-full max-w-sm h-40 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
                                        No image uploaded
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            onUpload(field, file);
                                        }
                                    }}
                                    className="block w-full max-w-sm text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-900 file:text-white file:cursor-pointer"
                                />

                                {uploadingKey === field.key ? (
                                    <p className="text-xs text-indigo-600">Uploading image...</p>
                                ) : null}
                            </div>
                        );
                    }

                    return (
                        <div key={field.key} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required ? <span className="text-red-500"> *</span> : null}
                            </label>
                            {field.helpText ? (
                                <p className="text-xs text-gray-500">{field.helpText}</p>
                            ) : null}

                            {field.type === "textarea" ? (
                                <textarea
                                    value={value}
                                    onChange={(e) => onChange(field.key, e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                />
                            ) : (
                                <input
                                    type={field.type === "number" ? "number" : "text"}
                                    value={value}
                                    onChange={(e) => onChange(field.key, e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
