/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "airbnb-rausch": "#FF5A5F",
        "airbnb-babu": "#00A699",
        "airbnb-arches": "#FC642D",
        "airbnb-hof": "#484848",
        "airbnb-foggy": "#767676",
      },
      fontFamily: {
        sans: [
          "Nunito Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        airbnb: "0.75rem",
      },
      boxShadow: {
        airbnb: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
