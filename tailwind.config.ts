import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", "[data-theme='midnight']"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        whisper: "rgb(var(--whisper) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)"
      },
      fontFamily: {
        serif: ["var(--font-libre-baskerville)", "Georgia", "serif"],
        italic: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: ["var(--font-figtree)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-highcrest)", "var(--font-libre-baskerville)", "Georgia", "serif"]
      },
      fontSize: {
        "reading-sm": ["17px", { lineHeight: "1.75" }],
        "reading": ["19px", { lineHeight: "1.78" }],
        "reading-lg": ["20px", { lineHeight: "1.8" }]
      },
      maxWidth: {
        reader: "650px",
        prose: "650px"
      },
      letterSpacing: {
        "meta": "0.08em",
        "wordmark": "-0.02em"
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
