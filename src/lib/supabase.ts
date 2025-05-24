import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/db/database.types";

// Force environment variables to be loaded at runtime
const getRuntimeConfig = () => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  console.log("Current Supabase configuration:", {
    url: supabaseUrl || "not set",
    keyExists: !!supabaseKey,
  });

  if (!supabaseUrl || supabaseUrl === "") {
    throw new Error("PUBLIC_SUPABASE_URL is not defined in environment variables. Check your .env file.");
  }

  if (supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost")) {
    throw new Error(
      `Invalid PUBLIC_SUPABASE_URL: ${supabaseUrl}. The URL is still pointing to localhost. Check your .env file and make sure it contains the remote URL.`
    );
  }

  if (!supabaseKey || supabaseKey === "") {
    throw new Error("PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables. Check your .env file.");
  }

  return { supabaseUrl, supabaseKey };
};

const config = getRuntimeConfig();

console.log("Supabase Configuration:", {
  url: config.supabaseUrl,
  keyPrefix: config.supabaseKey.substring(0, 10) + "...",
});

export const supabase = createBrowserClient<Database>(config.supabaseUrl, config.supabaseKey);
