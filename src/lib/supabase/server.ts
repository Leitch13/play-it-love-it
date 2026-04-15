import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

function cookieHandlers(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
        });
      } catch {
        // Called from a Server Component — session refresh handled by proxy.
      }
    },
  };
}

/**
 * Server-side Supabase client.
 * Returns null when credentials are not yet configured (local dev without .env.local).
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, { cookies: cookieHandlers(cookieStore) });
}

/**
 * Service-role client for privileged server operations.
 * Returns null when credentials are not configured. Never expose to the browser.
 */
export async function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, { cookies: cookieHandlers(cookieStore) });
}
