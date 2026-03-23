/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        dark: "#0F1419",
        surface: "#F7F8FA",
        card: "#FFFFFF",
        "text-primary": "#111318",
        "text-secondary": "#4B5563",
        "text-muted": "#9CA3AF",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
