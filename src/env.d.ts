/// <reference types="astro/client" />

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user?: User;
  }
}

interface ImportMetaEnv {
  readonly OPENAI_API_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  // Add your environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
