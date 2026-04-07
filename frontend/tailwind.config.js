/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EF4444", 
        secondary: "#F97316", 
        accent: "#D946EF", 
        success: "#10B981",
        warning: "#EAB308", 
        danger: "#EF4444",
        white: "#FFFCFA",
        slate: {
          50: '#FFF9F8',
          100: '#F7EDEA',
          200: '#EBDCD8',
          300: '#DBC5BF',
          400: '#C2A79F',
          500: '#A1837A',
          600: '#7D6158',
          700: '#5C433C',
          800: '#3D2823',
          900: '#2A0614', // Deep rich wine/fuchsia black as requested
          950: '#17030A',
        }
      },
      backgroundImage: {
        "logo-gradient": "linear-gradient(135deg, #D946EF 0%, #EF4444 33%, #F97316 66%, #EAB308 100%)",
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
