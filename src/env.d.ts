/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";

declare namespace App {
  interface Locals {
    supabase: SupabaseClient;
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
