import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { fetchOrderById } from "@/lib/orders";
import nodemailer from "nodemailer";

// Helper to format order items as an HTML table for emails
function formatItemsHtml(items: any[]): string {
    if (!items || items.length === 0) return "<p>No items found</p>";
    
    let html = `
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
    `;

    for (const item of items) {
        const qty = item.quantity_or_meters || item.quantity || 1;
        const price = item.price_per_unit || item.unit_price || 0;
        const total = item.total_price || (qty * price);
        html += `
            <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">${item.product_name} ${item.variant_color ? `(${item.variant_color})` : ''}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px; text-align: center;">${qty}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px; text-align: right;">₹${Number(price).toFixed(2)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px; text-align: right;">₹${Number(total).toFixed(2)}</td>
            </tr>
        `;
    }

    html += "</tbody></table>";
    return html;
}

// Helper to format order items as a bulleted text list for WhatsApp
function formatItemsText(items: any[]): string {
    if (!items || items.length === 0) return "No items";
    return items.map(item => {
        const qty = item.quantity_or_meters || item.quantity || 1;
        const price = item.price_per_unit || item.unit_price || 0;
        return `• ${qty}x ${item.product_name} (${item.variant_color || 'Default'}) - ₹${Number(price).toFixed(2)}`;
    }).join("\n");
}

// Helper to replace template variables with actual values
export function replaceVariables(template: string, vars: Record<string, string>): string {
    let output = template;
    for (const [key, value] of Object.entries(vars)) {
        // Replace all occurrences of {key} with value
        const regex = new RegExp(`{${key}}`, 'g');
        output = output.replace(regex, value ?? '');
    }
    return output;
}

// Core function to send email via SMTP using nodemailer
async function sendSmtpEmail(config: Record<string, string>, to: string, subject: string, htmlBody: string): Promise<boolean> {
    try {
        const host = config.notification_smtp_host;
        const port = parseInt(config.notification_smtp_port || "587");
        // Nodemailer expects secure to be true ONLY for direct SSL/TLS (usually port 465).
        // For STARTTLS (usually ports 587, 25, 2525), secure must be false.
        const secure = port === 465 ? true : (port === 587 || port === 25 || port === 2525 ? false : config.notification_smtp_secure === "true");
        const user = config.notification_smtp_user;
        const pass = config.notification_smtp_pass;
        const from = config.notification_smtp_from || user;

        if (!host || !user || !pass) {
            console.error("[Notifications] SMTP configuration missing required fields.");
            return false;
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            tls: {
                rejectUnauthorized: false // Helps avoid SSL handshake errors on custom domain hosts
            }
        });

        await transporter.sendMail({
            from,
            to,
            subject,
            html: htmlBody
        });

        console.log(`[Notifications] SMTP Email sent successfully to ${to}`);
        return true;
    } catch (err) {
        console.error("[Notifications] Failed to send SMTP Email:", err);
        return false;
    }
}

// Core function to send email via Resend API using native fetch
async function sendResendEmail(config: Record<string, string>, to: string, subject: string, htmlBody: string): Promise<boolean> {
    try {
        const apiKey = config.notification_resend_api_key;
        const from = config.notification_resend_from || "onboarding@resend.dev";

        if (!apiKey) {
            console.error("[Notifications] Resend API Key is missing.");
            return false;
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from,
                to: [to],
                subject,
                html: htmlBody
            })
        });

        if (!response.ok) {
            const errJson = await response.json();
            throw new Error(errJson?.message || `HTTP ${response.status}`);
        }

        console.log(`[Notifications] Resend Email sent successfully to ${to}`);
        return true;
    } catch (err) {
        console.error("[Notifications] Failed to send Resend Email:", err);
        return false;
    }
}

// Core function to send WhatsApp via Twilio API using native fetch
async function sendTwilioWhatsApp(config: Record<string, string>, to: string, bodyText: string): Promise<boolean> {
    try {
        const sid = config.notification_twilio_sid;
        const token = config.notification_twilio_auth_token;
        const from = config.notification_twilio_from || "whatsapp:+14155238886";

        if (!sid || !token) {
            console.error("[Notifications] Twilio configuration is missing Account SID or Auth Token.");
            return false;
        }

        // Clean recipient number and format for WhatsApp (must have country code prefix, e.g. +91...)
        let cleanTo = to.trim().replace(/\s+/g, "");
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
                Body: bodyText
            })
        });

        if (!response.ok) {
            const errJson = await response.json();
            throw new Error(errJson?.message || `HTTP ${response.status}`);
        }

        console.log(`[Notifications] Twilio WhatsApp sent successfully to ${cleanTo}`);
        return true;
    } catch (err) {
        console.error("[Notifications] Failed to send Twilio WhatsApp:", err);
        return false;
    }
}

// Main trigger handler called upon checkout and status changes
export async function triggerOrderNotification(
    orderId: string, 
    eventType: "confirmation" | "shipped" | "delivered"
): Promise<{ success: boolean; emailSent?: boolean; whatsappSent?: boolean; errors?: string[] }> {
    try {
        console.log(`[Notifications] Triggering ${eventType} notification for order: ${orderId}`);

        // 1. Fetch complete order details
        const order = await fetchOrderById(orderId);
        if (!order) {
            return { success: false, errors: ["Order not found"] };
        }

        // Determine recipient details
        const recipientEmail = order.user_email;
        const recipientPhone = order.shipping_address?.phone || order.contact_phone;

        if (!recipientEmail && !recipientPhone) {
            console.warn(`[Notifications] Order ${orderId} has no recipient contact details. Skipping.`);
            return { success: false, errors: ["No recipient email or phone available"] };
        }

        // 2. Fetch all configuration settings
        const { data: settingsData, error: settingsError } = await supabaseAdmin
            .from("settings")
            .select("key, value");

        if (settingsError || !settingsData) {
            throw new Error(settingsError?.message || "Failed to load notification settings");
        }

        const configMap: Record<string, string> = {};
        for (const row of settingsData) {
            configMap[row.key] = row.value || "";
        }

        // 3. Fetch specific templates for the event
        const emailTemplateKey = `order_${eventType}_email`;
        const whatsappTemplateKey = `order_${eventType}_whatsapp`;

        const { data: templates, error: templatesError } = await supabaseAdmin
            .from("notification_templates")
            .select("*")
            .in("key", [emailTemplateKey, whatsappTemplateKey]);

        if (templatesError || !templates) {
            throw new Error(templatesError?.message || "Failed to load notification templates");
        }

        const emailTemplate = templates.find(t => t.key === emailTemplateKey);
        const whatsappTemplate = templates.find(t => t.key === whatsappTemplateKey);

        // 4. Build replacement variables
        const customerName = order.shipping_address?.full_name || "Customer";
        const variablesMap: Record<string, string> = {
            userName: customerName,
            order_id: order.order_number,
            total_amount: `₹${Number(order.total_amount).toFixed(2)}`,
            subtotal: `₹${Number(order.subtotal).toFixed(2)}`,
            discount: `₹${Number(order.discount_amount).toFixed(2)}`,
            shipping: `₹${Number(order.shipping_amount).toFixed(2)}`,
            delivery_address: order.delivery_address || "",
            payment_method: (order.payment_method || "COD").toUpperCase(),
            tracking_url: order.tracking_url || "",
            items_list: "" // Formatted below
        };

        const result: { success: boolean; emailSent?: boolean; whatsappSent?: boolean; errors: string[] } = {
            success: true,
            errors: []
        };

        // 5. Send Email if recipient has email & email provider is active
        const emailProvider = configMap.notification_email_provider || "disabled";
        if (recipientEmail && emailProvider !== "disabled" && emailTemplate) {
            // Build items table for email
            variablesMap.items_list = formatItemsHtml(order.items);
            
            const subject = replaceVariables(emailTemplate.subject || "Order Update", variablesMap);
            const htmlBody = replaceVariables(emailTemplate.body, variablesMap);

            if (emailProvider === "resend") {
                result.emailSent = await sendResendEmail(configMap, recipientEmail, subject, htmlBody);
            } else if (emailProvider === "smtp") {
                result.emailSent = await sendSmtpEmail(configMap, recipientEmail, subject, htmlBody);
            }
            
            if (result.emailSent === false) {
                result.errors.push("Failed to send email notification");
            }
        }

        // 6. Send WhatsApp if recipient has phone & WhatsApp provider is active
        const whatsappProvider = configMap.notification_whatsapp_provider || "disabled";
        if (recipientPhone && whatsappProvider !== "disabled" && whatsappTemplate) {
            // Build items bullet list for WhatsApp
            variablesMap.items_list = formatItemsText(order.items);
            
            const whatsappBody = replaceVariables(whatsappTemplate.body, variablesMap);

            if (whatsappProvider === "twilio") {
                result.whatsappSent = await sendTwilioWhatsApp(configMap, recipientPhone, whatsappBody);
            } else if (whatsappProvider === "mock") {
                console.log("========================================");
                console.log(`[MOCK WHATSAPP NOTIFICATION TO: ${recipientPhone}]`);
                console.log(whatsappBody);
                console.log("========================================");
                result.whatsappSent = true;
            }

            if (result.whatsappSent === false) {
                result.errors.push("Failed to send WhatsApp notification");
            }
        }

        return {
            success: result.errors.length === 0,
            emailSent: result.emailSent,
            whatsappSent: result.whatsappSent,
            errors: result.errors.length > 0 ? result.errors : undefined
        };
    } catch (err: any) {
        console.error("[Notifications] Error processing order notification trigger:", err);
        return { success: false, errors: [err.message] };
    }
}

// Registration trigger handler called upon new user sign up
export async function triggerRegistrationNotification(
    userName: string,
    userEmail: string,
    userPhone?: string
): Promise<{ success: boolean; emailSent?: boolean; whatsappSent?: boolean; errors?: string[] }> {
    try {
        console.log(`[Notifications] Triggering registration notification for user: ${userEmail}`);

        // 1. Fetch all configuration settings
        const { data: settingsData, error: settingsError } = await supabaseAdmin
            .from("settings")
            .select("key, value");

        if (settingsError || !settingsData) {
            throw new Error(settingsError?.message || "Failed to load notification settings");
        }

        const configMap: Record<string, string> = {};
        for (const row of settingsData) {
            configMap[row.key] = row.value || "";
        }

        // 2. Fetch registration templates
        const emailTemplateKey = "customer_registration_email";
        const whatsappTemplateKey = "customer_registration_whatsapp";

        const { data: templates, error: templatesError } = await supabaseAdmin
            .from("notification_templates")
            .select("*")
            .in("key", [emailTemplateKey, whatsappTemplateKey]);

        if (templatesError || !templates) {
            throw new Error(templatesError?.message || "Failed to load registration templates");
        }

        const emailTemplate = templates.find(t => t.key === emailTemplateKey);
        const whatsappTemplate = templates.find(t => t.key === whatsappTemplateKey);

        // 3. Build replacement variables
        const formattedDate = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        const shopUrl = "https://ecom.doneone.in";

        const variablesMap: Record<string, string> = {
            userName: userName || "Valued Customer",
            userEmail: userEmail,
            registrationDate: formattedDate,
            shopUrl: shopUrl
        };

        const result: { success: boolean; emailSent?: boolean; whatsappSent?: boolean; errors: string[] } = {
            success: true,
            errors: []
        };

        // 4. Send Email if recipient has email & email provider is active
        const emailProvider = configMap.notification_email_provider || "disabled";
        if (userEmail && emailProvider !== "disabled" && emailTemplate) {
            const subject = replaceVariables(emailTemplate.subject || "Welcome to Shree Hari Cutpiece", variablesMap);
            const htmlBody = replaceVariables(emailTemplate.body, variablesMap);

            if (emailProvider === "resend") {
                result.emailSent = await sendResendEmail(configMap, userEmail, subject, htmlBody);
            } else if (emailProvider === "smtp") {
                result.emailSent = await sendSmtpEmail(configMap, userEmail, subject, htmlBody);
            }
            
            if (result.emailSent === false) {
                result.errors.push("Failed to send registration email notification");
            }
        }

        // 5. Send WhatsApp if recipient has phone & WhatsApp provider is active
        const whatsappProvider = configMap.notification_whatsapp_provider || "disabled";
        if (userPhone && whatsappProvider !== "disabled" && whatsappTemplate) {
            const whatsappBody = replaceVariables(whatsappTemplate.body, variablesMap);

            if (whatsappProvider === "twilio") {
                result.whatsappSent = await sendTwilioWhatsApp(configMap, userPhone, whatsappBody);
            } else if (whatsappProvider === "mock") {
                console.log("========================================");
                console.log(`[MOCK WHATSAPP NOTIFICATION TO: ${userPhone}]`);
                console.log(whatsappBody);
                console.log("========================================");
                result.whatsappSent = true;
            }

            if (result.whatsappSent === false) {
                result.errors.push("Failed to send registration WhatsApp notification");
            }
        }

        return {
            success: result.errors.length === 0,
            emailSent: result.emailSent,
            whatsappSent: result.whatsappSent,
            errors: result.errors.length > 0 ? result.errors : undefined
        };
    } catch (err: any) {
        console.error("[Notifications] Error processing registration notification trigger:", err);
        return { success: false, errors: [err.message] };
    }
}
