// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

const env = loadEnv("development", ".", "");

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap(), tailwind()],
  server: { port: 3000 },
  adapter: node({
    mode: "standalone",
  }),
  session: {
    driver: "node",
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["node"],
      },
    },
    // Force environment variables to be available
    envPrefix: ["PUBLIC_"],
    // Explicitly define environment variables
    define: {
      "import.meta.env.PUBLIC_SUPABASE_URL": JSON.stringify(env.PUBLIC_SUPABASE_URL || ""),
      "import.meta.env.PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(env.PUBLIC_SUPABASE_ANON_KEY || ""),
    },
  },
});
