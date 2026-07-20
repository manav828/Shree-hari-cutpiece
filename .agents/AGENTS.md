# Project-Scoped Rules & Reminders

## Shipping Encryption Configuration Reminder
- **Context**: The production environment variables `SHIPPING_ENCRYPTION_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are currently NOT configured in production, as the user is not actively using shipping features.
- **Rule**: Whenever the user asks any shipping-related questions or requests changes to the shipping module in the future, **always remind them** to configure `SHIPPING_ENCRYPTION_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in their production environment so that encrypted credentials can be decrypted at runtime.

## Database Schema Standardization & Multi-Theme Mapping Rules
- **Context**: To prevent database schema bloat and avoid "abandoned" (unused/null) columns, all storefront themes (Classic, Bohemian, Luxury, and Lighting) must share the same core database schema.
- **Rule**: When implementing theme-specific product details, developers and AI assistants must follow these mapping conventions instead of adding new columns to the `products` table:
  1. **Lit vs. Unlit Images (Lighting Theme)**: Map this to the `variant_images` relation. The primary image (index 0 / `is_primary = true`) is the **Unlit** image. The second image in the variant gallery (index 1) is the **Lit** hover image.
  2. **Technical Specifications (Kelvin, CRI, Dimmability, Warranty)**: Store as a JSON object inside the existing `custom_tabs` JSONB column under the ID `"specifications"`. The frontend theme component must parse this stringified JSON and render it as a key-value grid.
  3. **Artisan / Story / Designer Profile**: Reuse the existing core columns `artisan_headline`, `artisan_description`, `artisan_image`, and `artisan_quote`. In the Bohemian theme, label this section "Meet the Artisan"; in the Lighting theme, label it "Meet the Designer". Do not create duplicates like `designer_headline`.
  4. **Adding New Columns**: Only introduce new database columns or migrations if the feature requires backend-level database logic (such as SQL indexing, sorting, filtering, or complex table joins). For pure presentation or descriptive metadata, always reuse JSONB columns or standard tables.

