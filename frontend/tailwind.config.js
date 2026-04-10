/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Indigo 600
        secondary: "#10B981", // Emerald 500
        accent: "#8B5CF6", // Violet 500
        success: "#10B981",
        warning: "#F59E0B", 
        danger: "#EF4444",
        background: {
          light: "#F8FAFC",
          dark: "#0F172A",
        },
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      backgroundImage: {
        "logo-gradient": "linear-gradient(135deg, #4F46E5 0%, #10B981 100%)",
        "rgb-gradient": "linear-gradient(var(--angle), #4F46E5, #0ea5e9, #10b981, #d946ef, #4F46E5)",
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'md3-sm':  '8px',
        'md3-md':  '12px',
        'md3-lg':  '16px',
        'md3-xl':  '28px',
        'md3-full':'1000px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
