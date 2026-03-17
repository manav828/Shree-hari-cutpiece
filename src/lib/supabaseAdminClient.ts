import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Build-safe fallbacks prevent import-time crashes during Next.js route analysis on CI/Vercel.
// Runtime API calls still require real envs to function correctly.
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-service-role-key";

// A specialized Supabase client for server-side admin operations.
export const supabaseAdmin = createClient(supabaseUrl ?? fallbackUrl, supabaseServiceRoleKey ?? fallbackKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "supabase-admin-lock",
    },
});
