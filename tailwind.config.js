/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgba(0, 43, 54, 1)",
        secondary: "rgba(88, 110, 117, 1)",
        accent: "rgba(7, 54, 66, 1)",
        background: "rgba(0, 43, 54, 1)",
        surface: "rgba(7, 54, 66, 1)",
        text: "rgba(131, 148, 150, 1)",
        backgroundLight: "rgba(253, 246, 227, 1)", // Solarized light background
        surfaceLight: "rgba(238, 232, 213, 1)", // Solarized light surface
        textLight: "rgba(88, 110, 117, 1)", // Solarized dark gray text
        backgroundDark: "rgba(0, 43, 54, 1)", // Solarized dark background
        surfaceDark: "rgba(7, 54, 66, 1)", // Solarized dark surface
        textDark: "rgba(131, 148, 150, 1)", // Solarized light gray text
      },

      //     fontFamily: {
      //       pixelify: ["Pixelify Sans", "sans-serif"],
      //     },
    },
  },
  plugins: [],
};
