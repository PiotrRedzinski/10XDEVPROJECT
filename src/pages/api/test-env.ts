import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
      supabaseKeyStart: import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10),
      nodeEnv: import.meta.env.NODE_ENV,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
