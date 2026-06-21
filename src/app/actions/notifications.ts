"use server";

import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { verifyAdminSession } from "@/lib/adminAuth";

export interface NotificationTemplate {
    id: string;
    key: string;
    name: string;
    type: "email" | "whatsapp";
    subject: string | null;
    body: string;
    variables: string[];
    created_at: string;
    updated_at: string;
}

// 1. Fetch all notification templates
export async function fetchNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
        if (!(await verifyAdminSession())) {
            console.error("Unauthorized fetchNotificationTemplates attempt.");
            return [];
        }
        const { data, error } = await supabaseAdmin
            .from("notification_templates")
            .select("*")
            .order("key", { ascending: true });

        if (error) throw error;
        return (data ?? []) as NotificationTemplate[];
    } catch (err: any) {
        console.error("Error fetching notification templates:", err);
        return [];
    }
}

// 2. Fetch a specific template by key
export async function fetchTemplateByKey(key: string): Promise<NotificationTemplate | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from("notification_templates")
            .select("*")
            .eq("key", key)
            .maybeSingle();

        if (error) throw error;
        return data as NotificationTemplate | null;
    } catch (err: any) {
        console.error(`Error fetching template ${key}:`, err);
        return null;
    }
}

// 3. Update a template's subject and body
export async function updateNotificationTemplate(key: string, subject: string | null, body: string) {
    try {
        if (!(await verifyAdminSession())) {
            return { success: false, error: "Unauthorized: Admin session required." };
        }
        const { error } = await supabaseAdmin
            .from("notification_templates")
            .update({
                subject: subject || null,
                body,
                updated_at: new Date().toISOString()
            })
            .eq("key", key);

        if (error) throw error;

        revalidatePath("/admin/notifications-templates");
        return { success: true };
    } catch (err: any) {
        console.error("Error updating notification template:", err);
        return { success: false, error: err.message };
    }
}

// 4. Fetch notification settings configuration
export async function fetchNotificationConfig(): Promise<Record<string, string>> {
    try {
        if (!(await verifyAdminSession())) {
            console.error("Unauthorized fetchNotificationConfig attempt.");
            return {};
        }
        const { data, error } = await supabaseAdmin
            .from("settings")
            .select("key, value")
            .like("key", "notification_%");

        if (error) throw error;

        const config: Record<string, string> = {};
        if (data) {
            for (const row of data) {
                config[row.key] = row.value || "";
            }
        }
        return config;
    } catch (err: any) {
        console.error("Error fetching notification settings:", err);
        return {};
    }
}

// 5. Update notification settings configuration
export async function updateNotificationConfig(config: Record<string, string>) {
    try {
        if (!(await verifyAdminSession())) {
            return { success: false, error: "Unauthorized: Admin session required." };
        }
        // Prepare list of upserts
        const upserts = Object.entries(config).map(([key, value]) => ({
            key,
            value: String(value ?? "")
        }));

        for (const upsert of upserts) {
            const { error } = await supabaseAdmin
                .from("settings")
                .upsert(upsert, { onConflict: "key" });

            if (error) throw error;
        }

        revalidatePath("/admin/notifications-templates");
        return { success: true };
    } catch (err: any) {
        console.error("Error updating notification configuration:", err);
        return { success: false, error: err.message };
    }
}

// 6. Test send diagnostics function (Resend, SMTP, Twilio)
export async function testProviderConnection(provider: "resend" | "smtp" | "twilio", recipient: string, config: Record<string, string>) {
    try {
        if (!(await verifyAdminSession())) {
            return { success: false, error: "Unauthorized: Admin session required." };
        }
        if (provider === "smtp") {
            const host = config.notification_smtp_host;
            const port = parseInt(config.notification_smtp_port || "587");
            // Nodemailer expects secure to be true ONLY for direct SSL/TLS (usually port 465).
            // For STARTTLS (usually ports 587, 25, 2525), secure must be false.
            const secure = port === 465 ? true : (port === 587 || port === 25 || port === 2525 ? false : config.notification_smtp_secure === "true");
            const user = config.notification_smtp_user;
            const pass = config.notification_smtp_pass;
            const from = config.notification_smtp_from || user;

            if (!host || !user || !pass || !recipient) {
                return { success: false, error: "SMTP settings or test recipient are missing." };
            }

            const transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: { user, pass },
                tls: { rejectUnauthorized: false }
            });

            await transporter.sendMail({
                from,
                to: recipient,
                subject: "Test Notification - Shree Hari Cutpiece",
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #4f46e5;">Connection Test Successful!</h2>
                        <p>Hello,</p>
                        <p>This is a test email sent from the admin panel of <strong>Shree Hari Cutpiece</strong> via SMTP.</p>
                        <p>Your SMTP mail configurations are working correctly.</p>
                    </div>
                `
            });
            return { success: true };
        } 
        
        if (provider === "resend") {
            const apiKey = config.notification_resend_api_key;
            const from = config.notification_resend_from || "onboarding@resend.dev";

            if (!apiKey || !recipient) {
                return { success: false, error: "Resend API key or test recipient are missing." };
            }

            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    from,
                    to: [recipient],
                    subject: "Test Notification - Shree Hari Cutpiece",
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <h2 style="color: #4f46e5;">Connection Test Successful!</h2>
                            <p>Hello,</p>
                            <p>This is a test email sent from the admin panel of <strong>Shree Hari Cutpiece</strong> via Resend API.</p>
                            <p>Your Resend API configurations are working correctly.</p>
                        </div>
                    `
                })
            });

            if (!response.ok) {
                const errJson = await response.json();
                return { success: false, error: errJson?.message || `HTTP error ${response.status}` };
            }
            return { success: true };
        }

        if (provider === "twilio") {
            const sid = config.notification_twilio_sid;
            const token = config.notification_twilio_auth_token;
            const from = config.notification_twilio_from || "whatsapp:+14155238886";

            if (!sid || !token || !recipient) {
                return { success: false, error: "Twilio SID, token, or test phone are missing." };
            }

            let cleanTo = recipient.trim().replace(/\s+/g, "");
            if (!cleanTo.startsWith("whatsapp:")) {
                if (!cleanTo.startsWith("+")) {
                    cleanTo = `+${cleanTo}`;
                }
                cleanTo = `whatsapp:${cleanTo}`;
            }

            const authHeader = Buffer.from(`${sid}:${token}`).toString("base64");
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${authHeader}`
                },
                body: new URLSearchParams({
                    To: cleanTo,
                    From: from,
                    Body: "This is a test WhatsApp notification sent from *Shree Hari Cutpiece* Admin Panel! Twilio configuration works. ✅"
                })
            });

            if (!response.ok) {
                const errJson = await response.json();
                return { success: false, error: errJson?.message || `HTTP error ${response.status}` };
            }
            return { success: true };
        }

        return { success: false, error: "Unsupported provider type." };
    } catch (err: any) {
        console.error("Test send error:", err);
        return { success: false, error: err.message };
    }
}

// 7. Test Registration Notifications (Email & WhatsApp)
export async function testRegistrationNotification(
    testEmail: string, 
    testPhone: string, 
    testName: string
): Promise<{ success: boolean; emailSent?: boolean; whatsappSent?: boolean; errors?: string[] }> {
    try {
        if (!(await verifyAdminSession())) {
            return { success: false, errors: ["Unauthorized: Admin session required."] };
        }
        const { triggerRegistrationNotification } = await import("@/lib/notifications");
        const res = await triggerRegistrationNotification(testName, testEmail, testPhone);
        return res;
    } catch (err: any) {
        console.error("Error running registration test notification:", err);
        return { success: false, errors: [err.message] };
    }
}

// 8. Trigger Registration Notifications for Production User Signups
export async function handleUserRegistrationNotification(email: string, phone: string, name: string) {
    try {
        const { triggerRegistrationNotification } = await import("@/lib/notifications");
        const res = await triggerRegistrationNotification(name, email, phone);
        return res;
    } catch (err: any) {
        console.error("Failed to run signup registration notification:", err);
        return { success: false, errors: [err.message] };
    }
}
