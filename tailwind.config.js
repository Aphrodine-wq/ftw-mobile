/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FDF2F3",
          100: "#FCE4E6",
          200: "#FACDD1",
          300: "#F5A3AA",
          400: "#EC6B76",
          500: "#DE3E4D",
          600: "#C41E3A",
          700: "#A5182F",
          800: "#89162B",
          900: "#751829",
          950: "#410812",
        },
        dark: "#0F1419",
        surface: "#FDFBF8",
        card: "#FFFFFF",
        "text-primary": "#111318",
        "text-secondary": "#4B5563",
        "text-muted": "#9CA3AF",
        border: "#E5E1DB",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
