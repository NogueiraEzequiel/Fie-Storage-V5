/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          800: '#0046BE',
          900: '#00399E',
        },
        green: {
          600: '#28a745',
        },
        gray: {
          700: '#4a5568',
          800: '#2d3748',
        },
        red: {
          600: '#e3342f',
        },
        white: '#ffffff',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
};
