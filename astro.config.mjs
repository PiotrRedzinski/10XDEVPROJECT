// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

const env = loadEnv("development", ".", "");

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap(), tailwind()],
  adapter: cloudflare({
    mode: "directory",
    functionPerRoute: true,
  }),
  vite: {
    build: {
      rollupOptions: {
        external: ["node"],
      },
    },
    // Force environment variables to be available
    envPrefix: ["PUBLIC_", "OPENAI_"],
    // Explicitly define environment variables
    define: {
      "import.meta.env.PUBLIC_SUPABASE_URL": JSON.stringify(env.PUBLIC_SUPABASE_URL || ""),
      "import.meta.env.PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(env.PUBLIC_SUPABASE_ANON_KEY || ""),
      "import.meta.env.OPENAI_API_KEY": JSON.stringify(env.OPENAI_API_KEY || ""),
      "import.meta.env.OPENAI_API_URL": JSON.stringify(
        env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions"
      ),
    },
  },
});
