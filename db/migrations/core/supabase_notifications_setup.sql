-- ============================================================
-- SHREE HARI CUT PIECE - NOTIFICATION SYSTEM SETUP
-- ============================================================

-- 1. Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key         text UNIQUE NOT NULL,
    name        text NOT NULL,
    type        text NOT NULL CHECK (type IN ('email', 'whatsapp')),
    subject     text, -- Only used for email
    body        text NOT NULL, -- HTML for email, text for whatsapp
    variables   jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of strings
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role full access on notification_templates" ON public.notification_templates;

-- Allow full access to service role (server actions)
CREATE POLICY "Service role full access on notification_templates"
    ON public.notification_templates FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Seed default templates
INSERT INTO public.notification_templates (key, name, type, subject, body, variables)
VALUES 
(
    'order_confirmation_email',
    'Order Confirmation Email',
    'email',
    'Order Confirmed! Thank you for shopping with Shree Hari Cutpiece (Order #{order_id})',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f5f7; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e1e4e8; }
    .header { text-align: center; border-bottom: 2px solid #f1f1f1; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #4f46e5; text-decoration: none; }
    .content { padding: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #f1f1f1; padding-top: 20px; margin-top: 20px; }
    .order-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
    .item-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .item-table th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 13px; }
    .item-table td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .total-row { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="#" class="logo">Shree Hari Cutpiece</a>
    </div>
    <div class="content">
      <p>Hello <strong>{userName}</strong>,</p>
      <p>Thank you for your order! We have received your order and are starting to prepare it. You will receive another notification once your items have shipped.</p>
      
      <div class="order-details">
        <h3 style="margin-top: 0;">Order Summary</h3>
        <p style="margin: 5px 0;"><strong>Order Number:</strong> {order_id}</p>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> {payment_method}</p>
        <p style="margin: 5px 0;"><strong>Delivery Address:</strong> {delivery_address}</p>
        
        {items_list}
      </div>

      <p>If you have any questions or need to make changes, please contact us immediately.</p>
    </div>
    <div class="footer">
      <p>© 2026 Shree Hari Cutpiece. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
    '["userName", "order_id", "payment_method", "delivery_address", "items_list", "subtotal", "discount", "shipping", "total_amount"]'::jsonb
),
(
    'order_confirmation_whatsapp',
    'Order Confirmation WhatsApp',
    'whatsapp',
    NULL,
    'Hello {userName},

Thank you for shopping with *Shree Hari Cutpiece*! 🛍️

We have received your order *#{order_id}* for a total of *{total_amount}*. Our team is packing your items now. We will send you a message with tracking details as soon as it ships.

*Order Summary:*
{items_list}

🚚 *Shipping Address:*
{delivery_address}

Thank you for choosing us!',
    '["userName", "order_id", "total_amount", "items_list", "delivery_address"]'::jsonb
),
(
    'order_shipped_email',
    'Order Shipped Email',
    'email',
    'Your Order has been Shipped! (Order #{order_id})',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f5f7; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e1e4e8; }
    .header { text-align: center; border-bottom: 2px solid #f1f1f1; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #4f46e5; text-decoration: none; }
    .content { padding: 20px 0; text-align: center; }
    .footer { text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #f1f1f1; padding-top: 20px; margin-top: 20px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="#" class="logo">Shree Hari Cutpiece</a>
    </div>
    <div class="content">
      <p style="text-align: left;">Hello <strong>{userName}</strong>,</p>
      <p style="text-align: left;">Great news! Your order <strong>#{order_id}</strong> has been shipped and is on its way to you.</p>
      
      <p style="margin: 30px 0;">
        <a href="{tracking_url}" class="button" target="_blank">Track Your Shipment</a>
      </p>

      <p style="text-align: left; font-size: 13px; color: #666666;">If the button above does not work, you can copy and paste this URL into your browser: <br>{tracking_url}</p>
    </div>
    <div class="footer">
      <p>© 2026 Shree Hari Cutpiece. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
    '["userName", "order_id", "tracking_url"]'::jsonb
),
(
    'order_shipped_whatsapp',
    'Order Shipped WhatsApp',
    'whatsapp',
    NULL,
    'Hi {userName},

Good news! Your order *#{order_id}* has been shipped and is on its way to you. 🚚📦

You can track your delivery status in real-time here:
🔗 {tracking_url}

Thank you for shopping with *Shree Hari Cutpiece*!',
    '["userName", "order_id", "tracking_url"]'::jsonb
),
(
    'order_delivered_email',
    'Order Delivered Email',
    'email',
    'Delivered! Your order #{order_id} has arrived',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f5f7; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e1e4e8; }
    .header { text-align: center; border-bottom: 2px solid #f1f1f1; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #4f46e5; text-decoration: none; }
    .content { padding: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #f1f1f1; padding-top: 20px; margin-top: 20px; }
    .success-badge { display: inline-block; padding: 4px 12px; background: #def7ec; color: #03543f; border-radius: 9999px; font-weight: bold; font-size: 12px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="#" class="logo">Shree Hari Cutpiece</a>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="success-badge">Delivered</span>
      </div>
      <p>Hello <strong>{userName}</strong>,</p>
      <p>Your order <strong>#{order_id}</strong> has been successfully delivered! We hope you love your new fabrics.</p>
      <p>Thank you so much for choosing Shree Hari Cutpiece. We look forward to serving you again soon.</p>
    </div>
    <div class="footer">
      <p>© 2026 Shree Hari Cutpiece. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
    '["userName", "order_id"]'::jsonb
),
(
    'order_delivered_whatsapp',
    'Order Delivered WhatsApp',
    'whatsapp',
    NULL,
    'Hi {userName},

Your order *#{order_id}* has been successfully delivered! 🎉🏡

We hope you are happy with your fabrics. If you have any feedback or queries, feel free to reply to this message.

Thank you for choosing *Shree Hari Cutpiece*! Have a wonderful day.',
    '["userName", "order_id"]'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET name = EXCLUDED.name,
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    variables = EXCLUDED.variables;

-- 3. Seed settings for notification configurations
INSERT INTO public.settings (key, value, label)
VALUES 
('notification_email_provider', 'disabled', 'Active Email Provider (disabled / resend / smtp)'),
('notification_resend_api_key', '', 'Resend API Key'),
('notification_resend_from', 'Shree Hari Cutpiece <onboarding@resend.dev>', 'Resend From Email'),
('notification_smtp_host', 'smtp.gmail.com', 'SMTP Server Hostname'),
('notification_smtp_port', '587', 'SMTP Server Port'),
('notification_smtp_secure', 'false', 'SMTP SSL/TLS Secure Toggle (true / false)'),
('notification_smtp_user', '', 'SMTP Username / Login Email'),
('notification_smtp_pass', '', 'SMTP Password / App Password'),
('notification_smtp_from', 'Shree Hari <shop@gmail.com>', 'SMTP From Email'),
('notification_whatsapp_provider', 'mock', 'Active WhatsApp Provider (disabled / twilio / mock)'),
('notification_twilio_sid', '', 'Twilio Account SID'),
('notification_twilio_auth_token', '', 'Twilio Auth Token'),
('notification_twilio_from', 'whatsapp:+14155238886', 'Twilio Sandbox/From WhatsApp Number')
ON CONFLICT (key) DO NOTHING;
