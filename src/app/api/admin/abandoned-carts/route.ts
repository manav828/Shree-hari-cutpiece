import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import nodemailer from "nodemailer";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("abandoned_carts")
            .select("*")
            .order("last_seen", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ carts: data || [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load abandoned carts";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { action, id } = await req.json();

        if (!action || !id) {
            return NextResponse.json({ error: "Action and ID are required." }, { status: 400 });
        }

        // Fetch the cart record
        const { data: cart, error: cartError } = await supabaseAdmin
            .from("abandoned_carts")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (cartError || !cart) {
            return NextResponse.json({ error: "Cart record not found." }, { status: 404 });
        }

        if (action === "email") {
            if (!cart.email) {
                return NextResponse.json({ error: "No email address found for this cart." }, { status: 400 });
            }

            // Fetch SMTP settings
            const { data: settingsData } = await supabaseAdmin
                .from("settings")
                .select("key, value");

            const config: Record<string, string> = {};
            if (settingsData) {
                for (const s of settingsData) {
                    config[s.key] = s.value || "";
                }
            }

            const host = config.notification_smtp_host;
            const port = parseInt(config.notification_smtp_port || "587");
            const secure = port === 465 ? true : (port === 587 || port === 25 || port === 2525 ? false : config.notification_smtp_secure === "true");
            const user = config.notification_smtp_user;
            const pass = config.notification_smtp_pass;
            const from = config.notification_smtp_from || user || "noreply@shreehari.com";

            if (!host || !user || !pass) {
                return NextResponse.json({ error: "SMTP configuration is missing. Configure email credentials in settings." }, { status: 500 });
            }

            const itemsList = (cart.cart_data || []) as any[];
            const itemsHtml = itemsList.map((item) => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0;">
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;" />
                        <span style="font-weight: 600;">${item.name}</span>
                    </td>
                    <td style="padding: 10px 0; text-align: right;">
                        ${item.meters} ${item.selling_mode === "meter" ? "meters" : "pieces"}
                    </td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 600;">
                        ₹${(item.price * item.meters).toLocaleString("en-IN")}
                    </td>
                </tr>
            `).join("");

            const totalPrice = itemsList.reduce((sum, item) => sum + item.price * item.meters, 0);

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #1a202c; text-align: center; font-size: 24px; margin-bottom: 20px;">Complete Your Purchase at Shree Hari</h2>
                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">Hello,</p>
                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">You left some items in your shopping cart. We have reserved them for you. Return to your cart to complete your checkout and finalize your order:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart" style="background-color: #1a202c; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px;">Return to Checkout &rarr;</a>
                    </div>
                    
                    <h3 style="color: #2d3748; font-size: 16px; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-top: 30px;">Your Shopping Cart</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="border-bottom: 1px solid #cbd5e0; text-align: left;">
                                <th style="padding-bottom: 8px;">Product</th>
                                <th style="padding-bottom: 8px; text-align: right;">Qty</th>
                                <th style="padding-bottom: 8px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 15px 0 0 0; font-weight: bold; font-size: 16px;">Total Value</td>
                                <td style="padding: 15px 0 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #1a202c;">₹${totalPrice.toLocaleString("en-IN")}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;

            const transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: { user, pass },
                tls: { rejectUnauthorized: false }
            });

            await transporter.sendMail({
                from,
                to: cart.email,
                subject: "Don't miss out! Finish your purchase at Shree Hari",
                html: emailHtml
            });

            // Update record
            await supabaseAdmin
                .from("abandoned_carts")
                .update({
                    status: "notified",
                    notified_at: new Date().toISOString()
                })
                .eq("id", id);

            return NextResponse.json({ success: true, message: "Recovery email sent." });

        } else if (action === "whatsapp") {
            if (!cart.phone) {
                return NextResponse.json({ error: "No phone number found for this cart." }, { status: 400 });
            }

            console.log(`[WhatsApp Recovery Mock] Sending message to ${cart.phone}: Your cart is waiting!`);

            // Update record to notified
            await supabaseAdmin
                .from("abandoned_carts")
                .update({
                    status: "notified",
                    notified_at: new Date().toISOString()
                })
                .eq("id", id);

            return NextResponse.json({ success: true, message: "WhatsApp recovery sent (mocked)." });

        } else if (action === "recover") {
            await supabaseAdmin
                .from("abandoned_carts")
                .update({ status: "recovered" })
                .eq("id", id);

            return NextResponse.json({ success: true, message: "Status updated to recovered." });

        } else if (action === "delete") {
            await supabaseAdmin
                .from("abandoned_carts")
                .delete()
                .eq("id", id);

            return NextResponse.json({ success: true, message: "Record deleted." });
        }

        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
