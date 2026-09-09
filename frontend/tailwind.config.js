/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F2E8D5',
          300: '#E8D6B7',
          400: '#D9BC90',
          500: '#C79E66',
          600: '#AA7E45',
          700: '#8A6032',
          800: '#684523',
          900: '#472C15',
        },
        saffron: {
          50: '#FFF8EB',
          100: '#FEEDC7',
          200: '#FDD98F',
          300: '#FCC157',
          400: '#FBAF2E',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#FBE6DD',
          200: '#F6CEBD',
          300: '#EEAB94',
          400: '#E48165',
          500: '#D95D39',
          600: '#C24322',
          700: '#9E3218',
          800: '#7F2A17',
          900: '#692517',
        },
        indigoHeritage: {
          800: '#1e1e38',
          900: '#121324',
          950: '#0a0a14',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Merriweather', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
