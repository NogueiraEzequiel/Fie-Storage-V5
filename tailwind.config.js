/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          800: '#0046BE', // Nuevo color azul oscuro
        }
      }
    },
  },
  plugins: [],
};
