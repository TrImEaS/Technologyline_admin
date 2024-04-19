/** @type {import('tailwindcss').Config} */
export default {
  content: [ 
    './index.html',
    './src/**/*.jsx'],
  theme: {
    extend: {
      fontFamily:{
        'body': ['Rubik', 'sans-serif']
      }
    },
  },
  plugins: [],
}

