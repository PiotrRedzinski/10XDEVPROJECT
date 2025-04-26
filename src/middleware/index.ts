import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer } from "@/lib/supabase.server";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/register", "/reset-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect, cookies } = context;

  // Create Supabase client and add to locals
  const supabase = createSupabaseServer(cookies);
  context.locals.supabase = supabase;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return redirect("/login");
    }

    // Add user to locals for use in components
    context.locals.user = session.user;

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return redirect("/login");
  }
});
