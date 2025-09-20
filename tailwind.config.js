/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
      "*.{js,ts,jsx,tsx,mdx}"
],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}
