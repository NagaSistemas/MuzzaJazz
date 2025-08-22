/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./admin/*.html", 
    "./js/*.js",
    "./admin/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'muza-gold': '#D4AF37',
        'muza-burgundy': '#8B0000',
        'muza-dark': '#1A120B', 
        'muza-wood': '#5D4037',
        'muza-cream': '#F5F5DC'
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'raleway': ['Raleway', 'sans-serif']
      }
    },
  },
  plugins: [],
}