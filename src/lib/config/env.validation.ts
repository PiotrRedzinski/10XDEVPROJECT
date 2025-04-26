import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anonymous key is required"),
});

export function validateEnv(): void {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    const errors = result.error.errors.map((error) => {
      const field = error.path.join(".");
      return `${field}: ${error.message}`;
    });

    throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
  }
}
