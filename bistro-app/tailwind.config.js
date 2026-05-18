/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1a1008',
          primary: '#b85c28',
          cream: '#fdf6ee',
          muted: '#a8937a',
          surface: '#f0e6d9',
          border: '#e8d9c5',
          card: '#ffffff',
        },
      },
    },
  },
  plugins: [],
};
