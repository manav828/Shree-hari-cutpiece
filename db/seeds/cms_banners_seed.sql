-- Seed CMS banners (announcement, popup, shop top)
-- Safe to run multiple times; avoids duplicate active banners by title + placement.

INSERT INTO public.banners (
    title,
    content_text,
    image_url,
    link_url,
    placement,
    bg_color,
    text_color,
    is_active,
    start_date,
    end_date,
    priority
)
SELECT
    v.title,
    v.content_text,
    v.image_url,
    v.link_url,
    v.placement,
    v.bg_color,
    v.text_color,
    true,
    v.start_date,
    v.end_date,
    v.priority
FROM (
    VALUES
        (
            'Grand Opening Offer',
            'Flat 10% OFF on selected fabrics - Limited period offer.',
            NULL,
            '/shop',
            'announcement_bar',
            '#111827',
            '#F9FAFB',
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '30 day')::date,
            100
        ),
        (
            'Festive Popup',
            'Celebrate the season with premium collections and curated offers.',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80',
            '/shop',
            'popup',
            '#7C2D12',
            '#FEF3C7',
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '45 day')::date,
            90
        ),
        (
            'Shop Top Promo',
            'New arrivals now live. Explore latest silk and cotton blends.',
            NULL,
            '/shop',
            'shop_top',
            '#0F766E',
            '#ECFEFF',
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '60 day')::date,
            80
        )
) AS v(
    title,
    content_text,
    image_url,
    link_url,
    placement,
    bg_color,
    text_color,
    start_date,
    end_date,
    priority
)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.banners b
    WHERE b.title = v.title
      AND b.placement = v.placement
      AND b.deleted_at IS NULL
);
