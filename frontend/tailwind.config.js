/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EF4444", // Rojo corporativo
        secondary: "#F97316", // Naranja
        accent: "#D946EF", // Fucsia
        success: "#10B981",
        warning: "#EAB308", // Amarillo
        danger: "#EF4444",
        background: "#F8FAFC",
        surface: "#FFFFFF",
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
