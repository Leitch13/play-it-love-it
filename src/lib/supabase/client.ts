import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Browser (client-side) Supabase client.
 * Safe to use in Client Components and browser-only code.
 * Creates a new instance per call — wrap in useMemo or module-level singleton
 * if you need a stable reference inside a component.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
