import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// A specialized Supabase client for the Admin Panel that disables session persistence.
// This completely circumvents the gotrue-js "AbortError: Lock broken" race condition
// caused by concurrent data fetching alongside the global AuthContext.
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "supabase-admin-lock",
    },
});
