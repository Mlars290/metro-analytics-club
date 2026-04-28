/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette: navy + purple primary, light gray background
        navy: {
          50: '#f1f4f9',
          100: '#dde4ee',
          200: '#b9c6d8',
          300: '#8ba0bc',
          400: '#5a749a',
          500: '#3a587f',
          600: '#2a4366',
          700: '#1f3350',
          800: '#162439',
          900: '#0d1726',
          950: '#070d18'
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede8ff',
          200: '#dcd3ff',
          300: '#c0afff',
          400: '#a085ff',
          500: '#7c5cff',
          600: '#6b3df5',
          700: '#5a2cd9',
          800: '#4a26b0',
          900: '#3d228d'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(13, 23, 38, 0.04), 0 4px 12px rgba(13, 23, 38, 0.04)',
        cardHover: '0 1px 2px rgba(13, 23, 38, 0.06), 0 8px 24px rgba(13, 23, 38, 0.08)'
      }
    }
  },
  plugins: []
}
