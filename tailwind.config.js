/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "450px"
      }
    },
  },
  plugins: [
    require("tailwind-scrollbar")
  ],
}