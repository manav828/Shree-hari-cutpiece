import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Build-safe fallbacks avoid import-time crashes on CI/Vercel when envs are
// missing during route/module analysis. Runtime requests still require real envs.
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackAnonKey = "placeholder-anon-key";

// Global singleton for Next.js dev mode avoiding Hot Reload recreation
const globalForSupabase = globalThis as unknown as {
    supabase: ReturnType<typeof createClient> | undefined;
};

export const supabase =
    globalForSupabase.supabase ??
    createClient(supabaseUrl ?? fallbackUrl, supabaseAnonKey ?? fallbackAnonKey, {
        auth: {
            detectSessionInUrl: false,
            persistSession: true,
            autoRefreshToken: true,
            multiTab: false,
            storageKey: "shreehari.auth.token",
        },
    });

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;
