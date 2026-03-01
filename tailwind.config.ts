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
        "background-secondary": "#FDFBF7", // Warmer, more elegant secondary background
        foreground: "#1A1A1A",
        "text-secondary": "#666666",
        accent: "#8B1E3F",
        "accent-light": "#F9F5F6",
        border: "#E5E5E5",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-prompt": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(8px)" },
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-prompt": "slide-prompt 2s ease-in-out infinite",
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
        "premium": "0 4px 20px rgba(0, 0, 0, 0.04)",
        "premium-hover": "0 12px 40px rgba(0, 0, 0, 0.08)", // More elevated, softer shadow
      },
      transitionTimingFunction: {
        "premium": "cubic-bezier(0.25, 1, 0.5, 1)", // Smoother, more deliberate transition
      },
    },
  },
  plugins: [],
};
export default config;
