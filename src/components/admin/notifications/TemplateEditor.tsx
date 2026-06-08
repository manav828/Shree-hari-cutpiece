"use client";

import { useState, useRef } from "react";
import { Save, Check, Eye, Smartphone, ArrowLeft } from "lucide-react";
import { NotificationTemplate, updateNotificationTemplate } from "@/app/actions/notifications";
import { replaceVariables } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { Input } from "@/components/admin/ui/Input";

interface TemplateEditorProps {
    template: NotificationTemplate;
    onClose: () => void;
    onSave: (updatedTemplate: NotificationTemplate) => void;
}

export default function TemplateEditor({ template, onClose, onSave }: TemplateEditorProps) {
    const [subject, setSubject] = useState(template.subject || "");
    const [body, setBody] = useState(template.body);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<"edit" | "preview">("edit");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Dummy data to compile live preview
    const dummyVars: Record<string, string> = {
        userName: "Manav Patel",
        order_id: "SH-20260601-9874",
        total_amount: "₹1,962.50",
        subtotal: "₹2,125.00",
        discount: "₹212.50",
        shipping: "₹50.00",
        delivery_address: "12, Gandhi Nagar, Near Bus Stand, Surat, Gujarat - 395001",
        payment_method: "CASH ON DELIVERY (COD)",
        tracking_url: "https://track.delhivery.com/SH-20260601-9874",
        items_list: template.type === "email" 
            ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background-color: #f1f5f9; text-align: left;">
                        <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px;">Item Name</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px; text-align: center;">Qty / Meters</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px; text-align: right;">Unit Price</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">Pure Silk Saree (Golden Yellow)</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px; text-align: center;">2.5</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px; text-align: right;">₹850.00</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px; text-align: right;">₹2,125.00</td>
                    </tr>
                </tbody>
            </table>
            `
            : "• 2.5x Pure Silk Saree (Golden Yellow) - ₹850.00"
    };

    // Replace variables in preview
    const previewContent = replaceVariables(body, dummyVars);

    // Save handler
    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);

        const res = await updateNotificationTemplate(template.key, template.type === "email" ? subject : null, body);
        setIsSaving(false);

        if (res.success) {
            showToast("Template saved successfully!", "success");
            onSave({
                ...template,
                subject: template.type === "email" ? subject : null,
                body
            });
        } else {
            setSaveError(res.error || "An unknown error occurred while saving.");
            showToast(res.error || "Failed to save template.", "error");
        }
    };

    // Click helper to copy or insert variable
    const handleInsertVariable = (variable: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const insertText = `{${variable}}`;

        const newBody = text.substring(0, start) + insertText + text.substring(end);
        setBody(newBody);

        // Highlight variable copied status briefly
        setCopiedVariable(variable);
        setTimeout(() => setCopiedVariable(null), 1500);

        // Reset cursor focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + insertText.length, start + insertText.length);
        }, 50);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full flex flex-col overflow-hidden min-h-[80vh] animate-fadeIn">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-[16px] font-playfair font-bold text-gray-900 flex items-center gap-2">
                        {template.type === "email" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-bold tracking-wide">Email</span>
                        ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-bold tracking-wide">WhatsApp</span>
                        )}
                        {template.name}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">Template Key: <code className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 text-[11px]">{template.key}</code></p>
                </div>
                
                {/* View Switcher Tabs */}
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 overflow-hidden shadow-xs">
                        <button
                            onClick={() => setActiveView("edit")}
                            className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                                activeView === "edit"
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            Edit Code
                        </button>
                        <button
                            onClick={() => setActiveView("preview")}
                            className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                                activeView === "preview"
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            Live Preview
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-350 transition-all cursor-pointer shadow-xs"
                        title="Back to templates list"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>Back to Templates</span>
                    </button>
                </div>
            </div>

            {/* Grid Layout Editor / Preview (Toggleable) */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Column: Form Editor (Full Width) */}
                {activeView === "edit" && (
                    <div className="w-full flex flex-col p-6 overflow-y-auto animate-fadeIn">
                        <div className="space-y-4 flex-1">
                            {/* Subject Line for Email */}
                            {template.type === "email" && (
                                <Input
                                    type="text"
                                    label="Email Subject Line"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter email subject line"
                                    className="font-medium"
                                />
                            )}

                            {/* Variables list */}
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                    <span>Available Variables</span>
                                    <span className="text-[10px] font-semibold text-indigo-500 normal-case">(Click to insert at cursor position)</span>
                                </label>
                                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    {template.variables.map(variable => (
                                        <button
                                            key={variable}
                                            type="button"
                                            onClick={() => handleInsertVariable(variable)}
                                            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedVariable === variable ? (
                                                <Check className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <span className="text-[9px] text-slate-400 font-mono">{"{"}</span>
                                            )}
                                            {variable}
                                            {copiedVariable !== variable && <span className="text-[9px] text-slate-400 font-mono">{"}"}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Body Editor */}
                            <div className="space-y-1.5 flex flex-col flex-1 min-h-[350px]">
                                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                    <span>Template Body Code</span>
                                    <span className="text-[10px] font-semibold text-slate-400 normal-case">HTML supported for email</span>
                                </label>
                                <textarea
                                    ref={textareaRef}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder={template.type === "email" ? "Enter email HTML code here..." : "Enter WhatsApp notification message here..."}
                                    className="w-full flex-1 text-sm font-mono border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none bg-slate-900 text-slate-200"
                                />
                            </div>
                        </div>

                        {/* Save Actions Footer inside editor */}
                        {saveError && (
                            <p className="text-xs font-semibold text-red-600 my-2">{saveError}</p>
                        )}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? "Saving..." : "Save Template"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Right Column: Live Mock Preview (Full Width) */}
                {activeView === "preview" && (
                    <div className="w-full bg-slate-100 p-6 flex items-center justify-center overflow-y-auto animate-fadeIn">
                        <div className="w-full max-w-4xl h-full flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[500px]">
                            {/* Preview Control Headers */}
                            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                                <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                                    <Eye className="w-4 h-4 text-indigo-500" />
                                    Live Sandbox Preview
                                </span>
                                <div className="text-[10px] bg-slate-200 text-slate-500 font-bold px-2.5 py-0.5 rounded-full">
                                    Using Dummy Order Data
                                </div>
                            </div>

                            {/* Preview Frame */}
                            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-100 items-center">
                                {/* Email Preview Render */}
                                {template.type === "email" ? (
                                    <div className="w-full bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200 my-auto">
                                        {/* Browser Toolbar Mock */}
                                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-400 font-medium">
                                            To: {dummyVars.userName} &lt;test@customer.com&gt; | Subject: {subject ? replaceVariables(subject, dummyVars) : ""}
                                        </div>
                                        {/* HTML iframe content */}
                                        <iframe
                                            srcDoc={previewContent}
                                            title="Email Sandbox Preview"
                                            className="w-full h-[55vh] border-0"
                                            sandbox="allow-same-origin"
                                        />
                                    </div>
                                ) : (
                                    /* WhatsApp Mobile Chat Mock */
                                    <div className="w-[320px] max-w-full h-[560px] rounded-[36px] bg-slate-900 border-[10px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col my-auto">
                                        {/* Phone Notch/Status Bar */}
                                        <div className="h-6 bg-slate-950 flex justify-between items-center px-6 text-[10px] font-bold text-white">
                                            <span>9:41</span>
                                            <div className="flex items-center gap-1">
                                                <Smartphone className="w-2.5 h-2.5" />
                                                <span>5G</span>
                                            </div>
                                        </div>

                                        {/* WhatsApp App Header Mock */}
                                        <div className="bg-[#075e54] text-white px-4 py-2.5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                                                SH
                                            </div>
                                            <div>
                                                <h4 className="text-[12.5px] font-bold">Shree Hari Cutpiece</h4>
                                                <span className="text-[9px] text-teal-100/90 font-semibold">Business Account</span>
                                            </div>
                                        </div>

                                        {/* Chat Message Window Mock (Wallpaper) */}
                                        <div 
                                            className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-end"
                                            style={{
                                                backgroundColor: "#efeae2",
                                                backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                                                backgroundSize: "contain"
                                            }}
                                        >
                                            {/* Chat Bubble */}
                                            <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-md max-w-[85%] self-start relative border border-slate-100 animate-fadeIn">
                                                {/* WhatsApp text with formatting support */}
                                                <p className="text-[12px] text-slate-800 leading-normal whitespace-pre-wrap">
                                                    {previewContent
                                                        // Replace WhatsApp markdown with HTML equivalent for preview
                                                        .replace(/\*(.*?)\*/g, "<strong>$1</strong>") // bold
                                                        .replace(/_(.*?)_/g, "<em>$1</em>") // italics
                                                        .replace(/~(.*?)~/g, "<del>$1</del>") // strikethrough
                                                    }
                                                </p>
                                                <span className="text-[9px] text-slate-400 font-medium block text-right mt-1">
                                                    9:41 AM
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
