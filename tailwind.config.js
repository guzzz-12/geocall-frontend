/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "450px",
        tablet: "850px"
      }
    },
  },
  plugins: [
    require("tailwind-scrollbar")
  ],
}