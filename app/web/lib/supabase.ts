import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The panel uses the anon key on both server and browser. There is no login (brief 001), so RLS
// lets anon read orders and update them, and nothing else. Policies: app/supabase/migrations.
// These must be literal `process.env.NEXT_PUBLIC_*` reads so Next.js inlines them in the browser.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && anonKey);

let client: SupabaseClient | undefined;

export function supabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in app/web/.env.local",
    );
  }
  client ??= createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
}
