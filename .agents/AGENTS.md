# Project-Scoped Rules & Reminders

## Shipping Encryption Configuration Reminder
- **Context**: The production environment variables `SHIPPING_ENCRYPTION_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are currently NOT configured in production, as the user is not actively using shipping features.
- **Rule**: Whenever the user asks any shipping-related questions or requests changes to the shipping module in the future, **always remind them** to configure `SHIPPING_ENCRYPTION_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in their production environment so that encrypted credentials can be decrypted at runtime.
