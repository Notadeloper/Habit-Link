/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        rubik: ["Rubik-Regular", "sans-serif"],
        "rubik-bold": ["Rubik-Bold", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f4fbf5",
          100: "#dceede",
          200: "#b9dabb",
          300: "#93c47d",
          400: "#6da95a",
          500: "#4e8f40",
          600: "#3b7130",
          700: "#305927",
          800: "#284721",
          900: "#223b1e",
        },
        accent: {
          100: "#f8f5ec",
          200: "#efe8d1",
        },
        black: {
          DEFAULT: "#122013",
          100: "#71806f",
          200: "#3f4e40",
          300: "#18231a",
        },
        success: "#2f8f56",
        warning: "#d08f2b",
        danger: "#c94f45",
      },
    },
  },
  plugins: [],
};
