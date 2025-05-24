import { z } from "zod";

let isValidated = false;

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anonymous key is required"),
});

export function validateEnv(): void {
  if (isValidated) return;

  try {
    envSchema.parse({
      OPENAI_API_KEY: import.meta.env.OPENAI_API_KEY,
      PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    });
    isValidated = true;
  } catch (error) {
    throw new Error(`Environment validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
