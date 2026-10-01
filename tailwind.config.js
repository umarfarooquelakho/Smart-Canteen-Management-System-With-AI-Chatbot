/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C94720',
          50:  '#fdf3ef',
          100: '#fbe4da',
          200: '#f6c6b0',
          300: '#f1a580',
          400: '#e97a4d',
          500: '#C94720',
          600: '#b33c1a',
          700: '#943115',
          800: '#742710',
          900: '#5a1f0c',
        },
        beige: {
          DEFAULT: '#F5E8D0',
          50:  '#fdf9f3',
          100: '#F5E8D0',
          200: '#ecd4a8',
          300: '#e3bf7f',
        },
        charcoal: {
          DEFAULT: '#171717',
          50:  '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#2d2d2d',
          800: '#1f1f1f',
          900: '#171717',
        },
        seagreen: {
          DEFAULT: '#4F9D8A',
          50:  '#eef6f4',
          100: '#d0e9e5',
          200: '#a1d3ca',
          300: '#72bcaf',
          400: '#4F9D8A',
          500: '#3d7d6d',
          600: '#2e5f53',
          700: '#214540',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 2px 8px rgba(23,23,23,0.08)',
        'card-hover': '0 4px 20px rgba(23,23,23,0.12)',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
