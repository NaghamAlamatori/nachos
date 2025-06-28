/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
      },
      colors: {
        nachosYellow: '#f6d33d',
        nachosBg: '#ffffff',
      },
         backgroundColor: {
        nachosBg: '#ffffff', 
      },
    },
  },
  plugins: [],
}
