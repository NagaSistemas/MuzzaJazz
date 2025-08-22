/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
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
      },
      keyframes: {
        bounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-20px)' },
          '60%': { transform: 'translateY(-10px)' },
        },
        spin: {
          '100%': { transform: 'rotate(360deg)' }
        },
        sway: {
          '0%': { transform: 'rotate(-5deg)' },
          '100%': { transform: 'rotate(5deg)' }
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        bounce: 'bounce 2s infinite',
        spin: 'spin 20s linear infinite',
        sway: 'sway 3s ease-in-out infinite alternate',
        pulse: 'pulse 1.5s ease-in-out'
      }
    }
  },
  plugins: [],
}
