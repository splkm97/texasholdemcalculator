/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poker-green': '#0F5132',
        'poker-felt': '#1B5E20', 
        'card-red': '#DC2626',
        'card-black': '#1F2937',
        'gold': '#FFD700',
        'silver': '#C0C0C0'
      },
      fontFamily: {
        'poker': ['Georgia', 'Times', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 8px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 6px 12px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}