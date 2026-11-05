// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edf8ff',
          100: '#d9efff',
          200: '#b9e4ff',
          300: '#97d7ff',
          400: '#70b9e2',
          500: '#4d8dba',
          600: '#24759b',
          700: '#086288',
          800: '#07516f',
          900: '#063f56',
        },
        gray: {
          50: '#fffaf0',
          100: '#fff3d8',
          200: '#efe7d5',
          300: '#d4dce0',
          400: '#a9bdc9',
          500: '#718c9b',
          600: '#536d7c',
          700: '#3b5968',
          800: '#23485a',
          900: '#123b50',
        },
      },
    },
  },
  plugins: [],
}
