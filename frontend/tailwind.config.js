/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stellar: {
          primary: '#7D00FF',
          secondary: '#00D9FF',
          dark: '#0C0E14',
          light: '#1A1D29',
        }
      }
    },
  },
  plugins: [],
}

