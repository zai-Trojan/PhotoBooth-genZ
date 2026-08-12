import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) return browserClient;
  const { url, key } = requirePublicSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, key);
  return browserClient;
}
