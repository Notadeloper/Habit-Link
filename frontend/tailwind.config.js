/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        fontFamily: {
            rubik: ['Rubik-Bold', 'sans-serif'],
            rubik: ['Rubik-Regular', 'sans-serif']
        },
        colors: {
            blue: {
                DEFAULT: "#3B82F6",
            },
            primary: {
              100: "#93c47d0A",
              200: "#93c47d1A",
              300: "#93c47d",
            },
            accent: {
              100: "#FBFBFD",
            },
            black: {
              DEFAULT: "#000000",
              100: "#8C8E98",
              200: "#666876",
              300: "#191D31",
            },
            danger: "#F75555",
          },
      },
    },
    plugins: [],
  }