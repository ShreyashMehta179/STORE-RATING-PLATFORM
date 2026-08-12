/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F3FAF4',
          100: '#EAF6EC',
          200: '#CBEBD2',
          300: '#9AD6A9',
          400: '#52B86E',
          500: '#16803A', // Primary Green
          600: '#0F5F2D', // Dark Green
          700: '#0B3D24', // Deep Green
          800: '#082E1B',
          900: '#051E12',
          950: '#021009',
        },
        warm: {
          50: '#FCFBF7', // Warm White
          100: '#F7F4EC', // Cream
          200: '#EFEAE0',
          300: '#E3DDD0',
          800: '#2A2E2B',
          900: '#151A17', // Main Text
          950: '#0E1210',
        },
        surface: {
          border: '#E3E8E2',
          muted: '#5F6861',
        },
        accent: {
          gold: '#F4B740',
          softGold: '#FFF4D8',
          coral: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(21, 26, 23, 0.04), 0 1px 4px -1px rgba(21, 26, 23, 0.02)',
        'soft-md': '0 12px 24px -6px rgba(21, 26, 23, 0.06), 0 4px 8px -2px rgba(21, 26, 23, 0.03)',
        'soft-xl': '0 20px 40px -12px rgba(21, 26, 23, 0.1), 0 8px 16px -4px rgba(21, 26, 23, 0.04)',
      },
    },
  },
  plugins: [],
};
