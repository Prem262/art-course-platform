import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#FAF8F5",
          surface: "#FFFFFF",
          "surface-alt": "#F3EFEA",
          "surface-hover": "#ECE6DD",
          border: "#E7E2D8",
          "border-subtle": "#F0ECE5",
          ink: "#141413",
          "ink-soft": "#292724",
          "ink-muted": "#6E6B65",
          "ink-faint": "#A6A29A",
          accent: "#2A4E39", // Deep Botanical Sage
          "accent-light": "#F1F6F3",
          "accent-border": "#CEE0D4",
          ochre: "#8B6D36",
          "ochre-light": "#FAF5EA",
          error: "#8F2D2D",
          "error-light": "#FAF0F0",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(20, 20, 19, 0.04), 0 6px 24px rgba(20, 20, 19, 0.03)",
        card: "0 2px 8px rgba(20, 20, 19, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
