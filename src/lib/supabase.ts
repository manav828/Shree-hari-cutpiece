import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Global singleton for Next.js dev mode avoiding Hot Reload recreation
const globalForSupabase = globalThis as unknown as {
    supabase: ReturnType<typeof createClient> | undefined;
};

export const supabase =
    globalForSupabase.supabase ??
    createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            detectSessionInUrl: true,
            persistSession: true,
            // Temporarily use a custom lock identifier to prevent hot-reload steals
            storageKey: 'supabase.auth.token'
        },
    });

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;
