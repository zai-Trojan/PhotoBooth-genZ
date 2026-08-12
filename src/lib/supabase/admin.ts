import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Server-side Supabase credentials are missing.");
  return createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
