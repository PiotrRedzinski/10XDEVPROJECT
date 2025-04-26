import type { SupabaseClient } from "@supabase/supabase-js";

declare module "astro" {
  interface Locals {
    supabase: SupabaseClient;
  }
}
