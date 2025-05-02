import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "@/db/database.types";

export function createSupabaseServer(cookies: AstroCookies) {
  return createServerClient<Database>(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(key: string) {
        const cookie = cookies.get(key);
        return cookie?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        cookies.set(key, value, {
          ...options,
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        });
      },
      remove(key: string, options: CookieOptions) {
        cookies.delete(key, {
          ...options,
          path: "/",
        });
      },
    },
  });
}
