/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // ← Add this line
  theme: {
    extend: {},
  },
  plugins: [],
};
