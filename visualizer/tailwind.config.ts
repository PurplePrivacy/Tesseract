import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ok: "#27ae60",
        warn: "#f1c40f",
        bad: "#e74c3c",
        ink: {
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#dcdcde",
          300: "#c3c3c6",
          400: "#9b9ba1",
          500: "#6f6f78",
          600: "#55555d",
          700: "#43434a",
          800: "#2d2d32",
          900: "#1f1f23"
        }
      },
      boxShadow: {
        soft: "0 6px 24px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      }
    }
  },
  plugins: []
} satisfies Config;
