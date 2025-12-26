import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Use empty strings as fallbacks so createBrowserClient doesn't throw an immediate error
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createBrowserClient(url, key);
}
