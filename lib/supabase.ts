import { createClient } from "@supabase/supabase-js";

/**
 * Supabase now handles Realtime only — Postgres access moved to Prisma
 * (see lib/prisma.ts), and Storage moved to DropAPHI (screenshots) +
 * UploadThing (video). Keep this client if you wire up Realtime status
 * updates on the record page; drop it if you don't end up needing that.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
