/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: { bi: { blue: '#003366', gold: '#C8A951', light: '#E8F0F8', dark: '#001A33' } },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
