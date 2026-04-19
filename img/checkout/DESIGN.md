# Design System Strategy: The Artisanal Archive

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

Unlike traditional e-commerce platforms that feel like rigid vending machines, this system is designed to feel like a high-end, tactile editorial lookbook. It rejects the "templated" nature of the web by prioritizing intentional asymmetry, generous negative space, and a layered, physical depth. We are not just selling products; we are curating a lifestyle of warmth and natural beauty. By breaking the standard 12-column grid with overlapping images and text elements, we create a rhythmic, organic flow that mimics the cozy, unhurried nature of a bohemian home.

## 2. Colors: Earthy Sophistication
The palette is rooted in the natural world—terracotta, sage, and mustard—balanced by a warm cream base that provides a breathable, sun-drenched atmosphere.

*   **Primary (`#9f3f29`):** A rich Terracotta used for calls to action and key brand moments.
*   **Secondary (`#5a6245`):** A muted Sage Green for grounding elements and natural accents.
*   **Tertiary (`#785900`):** A Mustard Yellow used sparingly for high-interest highlights.
*   **Surface Foundation (`#fcf9f4`):** A creamy, off-white background that prevents the "stark white" digital fatigue.

### The "No-Line" Rule
To maintain an artisanal feel, **1px solid borders are strictly prohibited** for sectioning or containment. Boundaries must be defined through background color shifts. For example, a `surface-container-low` section should sit directly against a `surface` background to define its edges.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine papers. 
- Use the `surface-container` tiers (Lowest to Highest) to create depth.
- **The Glass & Gradient Rule:** For main CTAs or high-end hero sections, use subtle linear gradients transitioning from `primary` to `primary_container`. For floating navigation or modals, utilize **Glassmorphism**: semi-transparent surface colors (e.g., `surface` at 80% opacity) with a `20px` backdrop-blur to allow the rich background tones to bleed through.

## 3. Typography: The Editorial Contrast
We employ a "High-Contrast Pairing" to evoke the feeling of a premium lifestyle magazine.

*   **Headings (Newsreader):** An elegant, high-contrast serif. This font carries the "soul" of the brand. Use `display-lg` (3.5rem) for hero statements and `headline-md` (1.75rem) for product categories. The slight organic variance in serif stems conveys an artisanal, hand-crafted quality.
*   **Body & Utility (Manrope):** A clean, modern sans-serif. This provides the functional clarity required for e-commerce. `body-lg` (1rem) ensures readability for product descriptions, while `label-md` (0.75rem) handles technical metadata.

The hierarchy is designed to lead the eye: bold Serifs capture the emotion, while the Sans-Serif delivers the detail.

## 4. Elevation & Depth: Tonal Layering
In this system, elevation is a product of color, not shadow. We avoid the "floating" look of standard material design in favor of "stacked" surfaces.

*   **The Layering Principle:** Depth is achieved by placing a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift that feels like physical stationery.
*   **Ambient Shadows:** If an element must float (e.g., a "Quick Buy" FAB), use a "Sunlight Shadow." The shadow must be extra-diffused (Blur: 32px, Spread: -4px) and use a tinted version of `on-surface` at 5% opacity. Never use pure black or grey.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

## 5. Components: Tactile & Refined

*   **Buttons:**
    *   **Primary:** Filled with `primary`, using a `0.5rem` (DEFAULT) roundedness. Apply a subtle gradient to `primary_container` for depth.
    *   **Secondary:** No fill. Use a "Ghost Border" and `on-surface` text.
*   **Input Fields:** Use `surface-container-high` as the background fill rather than a border. On focus, transition the background to `surface-bright` with a 1px `primary` underline.
*   **Cards:** Forbid divider lines. Use `1.5rem` (xl) spacing to separate the product image from its title. The card container should be a slightly different surface tier than the page background.
*   **Chips:** Use `secondary_container` for category filters. Roundedness should be `full` (9999px) to contrast with the more structured cards.
*   **Editorial Overlays:** A signature component where text (`display-sm`) partially overlaps an image. This breaks the grid and reinforces the "curated" vibe.
*   **The "Curator" Carousel:** Forgo standard arrows; use a progress bar styled with `outline-variant` and a `primary` indicator to show movement through a collection.

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Offset images in a gallery to create a more natural, "homey" rhythm.
*   **Layer Tones:** Use the full range of `surface-container` tokens to create "rooms" within the page layout.
*   **Prioritize Breathing Room:** Use the `xl` and `lg` spacing scales generously. High-end e-commerce requires space to breathe.

### Don't:
*   **No "Boxy" Grids:** Avoid perfectly aligned rows of 4 cards. Vary the sizes to mimic a curated gallery wall.
*   **No High-Contrast Borders:** Never use `#000000` or high-opacity outlines; they shatter the "cozy" atmosphere.
*   **No Default Shadows:** Avoid the standard "Drop Shadow" presets in design tools. If it looks like a standard app, it has failed the brand.