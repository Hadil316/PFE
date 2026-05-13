/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'os-bg': "linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fae8ff 100%)",
      }
    }
  },
  plugins: [],
}