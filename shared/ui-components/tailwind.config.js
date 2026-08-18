/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F2FF',
          100: '#CCE5FF',
          200: '#99CCFF',
          300: '#66B2FF',
          400: '#3399FF',
          500: '#007AFF',
          600: '#0062CC',
          700: '#004A99',
          800: '#003366',
          900: '#001A33',
        },
        secondary: {
          50: '#EEEDFC',
          100: '#DDDBF9',
          200: '#BBB8F3',
          300: '#9994ED',
          400: '#7771E7',
          500: '#5856D6',
          600: '#4644AB',
          700: '#353380',
          800: '#232255',
          900: '#12112A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};