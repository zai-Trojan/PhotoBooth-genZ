export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  livekitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
};

export function requirePublicSupabaseEnv() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabasePublishableKey) {
    throw new Error("Supabase is not configured. Copy .env.example to .env.local and fill its values.");
  }
  return { url: publicEnv.supabaseUrl, key: publicEnv.supabasePublishableKey };
}

export function isBackendConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabasePublishableKey && publicEnv.livekitUrl);
}
