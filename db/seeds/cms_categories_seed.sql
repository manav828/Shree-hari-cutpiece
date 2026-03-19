-- Seed CMS categories from src/data/categories.json defaults
-- Safe to run multiple times: inserts only missing active slugs

INSERT INTO public.categories (name, slug, description, image, sort_order, is_active)
SELECT v.name, v.slug, v.description, v.image, v.sort_order, true
FROM (
    VALUES
        ('Cotton', 'cotton', 'Breathable & comfortable everyday fabrics', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80', 0),
        ('Silk', 'silk', 'Luxurious fabrics for special occasions', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80', 1),
        ('Georgette', 'georgette', 'Elegant drape for graceful outfits', 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80', 2),
        ('Rayon', 'rayon', 'Soft & flowy for daily comfort', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80', 3),
        ('Chiffon', 'chiffon', 'Sheer elegance for festive wear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80', 4),
        ('Crepe', 'crepe', 'Textured beauty for modern styles', 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80', 5)
) AS v(name, slug, description, image, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.categories c
    WHERE c.slug = v.slug
      AND c.deleted_at IS NULL
);
