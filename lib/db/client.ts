/**
 * Clients Supabase pour AcademIA.
 *
 * Trois variantes :
 *   - createBrowserClient()  : composants client (React Client Components)
 *   - createServerClient()   : RSC / Server Actions / Route Handlers, lit
 *                              les cookies de l'utilisateur (RLS appliquée)
 *   - createServiceClient()  : Route Handlers privilégiés (ingestion,
 *                              écriture conv/messages). Bypass RLS.
 *
 * NE PAS exposer createServiceClient côté client.
 */

import { createBrowserClient as ssrBrowser, createServerClient as ssrServer } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getPublicEnv, getServerEnv } from "./env";
import type { Database } from "./types";

export function createBrowserClient() {
  const env = getPublicEnv();
  return ssrBrowser<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createServerClient() {
  const env = getServerEnv();
  const cookieStore = await cookies();
  return ssrServer<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Appelé depuis un Server Component pur — ignorable, le
            // refresh tokens passera par le middleware.
          }
        },
      },
    }
  );
}

/**
 * Service-role client : à n'utiliser QUE depuis le serveur (Route Handlers
 * de l'API), jamais depuis le client. Bypass RLS.
 */
export function createServiceClient() {
  const env = getServerEnv();
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
