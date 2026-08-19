import { neon } from "@neondatabase/serverless";

// Client untuk kueri SQL langsung (lazy-load agar tidak error saat build Next.js)
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured. Add it to your env variables.");
  }
  const client = neon(process.env.DATABASE_URL);
  return client(strings, ...values);
};

