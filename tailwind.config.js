/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(0 43 54)",
        secondary: "rgb(88 110 117)",
        accent: "rgb(7 54 66)",
        background: "rgb(0 43 54)",
        surface: "rgb(7 54 66)",
        text: "rgb(131 148 150)",
        backgroundLight: "rgb(253 246 227)", // Solarized light background
        surfaceLight: "rgb(238 232 213)", // Solarized light surface
        textLight: "rgb(88 110 117)", // Solarized dark gray text
        backgroundDark: "rgb(0 43 54)", // Solarized dark background
        surfaceDark: "rgb(7 54 66)", // Solarized dark surface
        textDark: "rgb(131 148 150)", // Solarized light gray text
      },
    },
  },
  // Tailwind v4 no longer uses plugins, we'll migrate any plugin functionality as needed
};
