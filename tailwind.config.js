/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'tablet': '800px',
        'lg': '1024px',
        'xl': '1280px',
        // Landscape orientations
        'landscape-phone': {
          'raw': '(max-height: 430px) and (orientation: landscape)'
        },
        'landscape-tablet': {
          'raw': '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)'
        }
      },
      fontSize: {
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
      },
      spacing: {
        'touch': '44px',
        'safe-top': 'var(--safe-top)',
        'safe-bottom': 'var(--safe-bottom)',
        'safe-left': 'var(--safe-left)',
        'safe-right': 'var(--safe-right)',
      },
    },
  },
  plugins: [],
}
