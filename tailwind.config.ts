import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Design System
        background: "#FFFFFF",
        "background-secondary": "#FAFAFA",
        foreground: "#1A1A1A",
        "text-secondary": "#666666",
        accent: "#8B1E3F",
        "accent-light": "#F9F5F6",
        border: "#E5E5E5",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      spacing: {
        "section": "120px",
        "section-sm": "80px",
      },
      fontSize: {
        "display": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        "premium": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "premium-hover": "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
      transitionTimingFunction: {
        "premium": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
