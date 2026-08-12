import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = requirePublicSupabaseEnv();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies; Route Handlers can.
        }
      },
    },
  });
}
