import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR-PROJECT')
);

let browserClient: SupabaseClient | null = null;
export function getBrowserClient(): SupabaseClient | null {
  if (!configured) return null;
  if (!browserClient) browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } }
  );
  return browserClient;
}
export function getServerClient(): SupabaseClient | null {
  if (!configured) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}
