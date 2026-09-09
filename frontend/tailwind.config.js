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
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#F0F2F5',
          300: '#D6D9E0',
          400: '#9DA4B0',
          500: '#646C7C',
          600: '#4B5262',
          700: '#333844',
          800: '#1F222A',
          900: '#12141A',
        },
        saffron: {
          50: '#FFFFFF',
          100: '#F8F9FA',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#FFFFFF',
          600: '#E2E4E9',
          700: '#9DA4B0',
          800: '#646C7C',
          900: '#333844',
        },
        terracotta: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#C5A880',
          600: '#A68860',
          700: '#876840',
          800: '#684820',
          900: '#492800',
        },
        indigoHeritage: {
          800: '#1a1d24',
          900: '#12141a',
          950: '#0a0b0e',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
