import { createServerClient, type CookieOptionsWithName, createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
console.log("superbase.client.ts using Supabase URL:", supabaseUrl);

if (!supabaseUrl) throw new Error("Missing env.SUPABASE_URL");
if (!supabaseAnonKey) throw new Error("Missing env.SUPABASE_ANON_KEY");

// Client for Astro.locals context
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Browser client for React components
export function createBrowserSupabaseClient() {
  console.log("[createBrowserSupabaseClient] Creating browser client with:", {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
  });

  const isBrowser = typeof window !== "undefined";

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: isBrowser ? window.localStorage : undefined,
      flowType: "pkce",
    },
    cookies: {
      get(name: string) {
        if (!isBrowser) return null;
        console.log(`[Browser Client] Getting cookie ${name}`);
        const cookie = document.cookie.split("; ").find((row) => row.startsWith(name + "="));
        if (!cookie) {
          console.log(`[Browser Client] Cookie ${name} not found`);
          return null;
        }
        const value = decodeURIComponent(cookie.split("=")[1]);
        console.log(`[Browser Client] Cookie ${name} found`);
        return value;
      },
      set(name: string, value: string, options: CookieOptionsWithName) {
        if (!isBrowser) return;
        console.log(`[Browser Client] Setting cookie ${name}`);
        let cookie = name + "=" + encodeURIComponent(value);
        if (options.maxAge) {
          cookie += "; Max-Age=" + options.maxAge;
        }
        if (options.path) {
          cookie += "; Path=" + options.path;
        }
        if (options.secure) {
          cookie += "; Secure";
        }
        if (options.sameSite) {
          cookie += "; SameSite=" + options.sameSite;
        }
        document.cookie = cookie;
      },
      remove(name: string, options: CookieOptionsWithName) {
        if (!isBrowser) return;
        console.log(`[Browser Client] Removing cookie ${name}`);
        document.cookie = name + "=; Max-Age=0" + (options.path ? "; Path=" + options.path : "");
      },
    },
  });
}

// Cookie options for auth
export const cookieOptions: CookieOptionsWithName = {
  name: "sb-auth-token",
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Type for cookie methods
interface CookieInterface {
  get(name: string): { value: string | null } | null;
  set(name: string, value: string, options?: CookieOptionsWithName): void;
  delete(name: string, options?: { path?: string }): void;
}

export function createSupabaseServerInstance(context: { cookies: CookieInterface; headers: Headers }) {
  console.log("[createSupabaseServerInstance] Creating server instance with:", {
    hasCookies: !!context.cookies,
    hasHeaders: !!context.headers,
    cookieKeys: context.cookies ? Object.keys(context.cookies) : [],
  });

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      flowType: "pkce",
    },
    cookies: {
      get(name: string) {
        const cookie = context.cookies.get(name);
        console.log(`[Supabase Server] Getting cookie ${name}:`, cookie?.value ?? null);
        return cookie?.value ?? null;
      },
      set(name: string, value: string) {
        console.log(`[Supabase Server] Setting cookie ${name}`);
        context.cookies.set(name, value, {
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      },
      remove(name: string) {
        console.log(`[Supabase Server] Removing cookie ${name}`);
        context.cookies.delete(name, { path: "/" });
      },
    },
  });
}
