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
      // Typography scale (Precision & Density)
      fontSize: {
        '10': '10px',
        '11': '11px',
        '12': '12px',
        '13': '13px',
        '14': '14px',   // Base
        'base': '14px', // Default
        '16': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      // Spacing system (4px grid enforcement)
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        // Semantic spacing
        'touch': '44px',
        'safe-top': 'var(--safe-top)',
        'safe-bottom': 'var(--safe-bottom)',
        'safe-left': 'var(--safe-left)',
        'safe-right': 'var(--safe-right)',
      },
      // Border radius (sharp, technical)
      borderRadius: {
        'none': '0',
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '12px',  // Override default 16px
        '2xl': '12px', // Override default 24px
        'full': '9999px',
      },
      // Colors (design token integration)
      colors: {
        'bg': {
          'primary': 'var(--color-bg-primary)',
          'secondary': 'var(--color-bg-secondary)',
          'tertiary': 'var(--color-bg-tertiary)',
          'hover': 'var(--color-bg-hover)',
          'active': 'var(--color-bg-active)',
        },
        'border': {
          'primary': 'var(--color-border-primary)',
          'secondary': 'var(--color-border-secondary)',
          'focus': 'var(--color-border-focus)',
        },
        'text': {
          'primary': 'var(--color-text-primary)',
          'secondary': 'var(--color-text-secondary)',
          'muted': 'var(--color-text-muted)',
          'faint': 'var(--color-text-faint)',
        },
        'accent': {
          'primary': 'var(--color-accent-primary)',
          'hover': 'var(--color-accent-primary-hover)',
          'active': 'var(--color-accent-primary-active)',
        },
        'success': 'var(--color-success-solid)',
        'warning': 'var(--color-warning-solid)',
        'error': 'var(--color-error-solid)',
        'info': 'var(--color-info-solid)',
      },
      // Animation
      transitionDuration: {
        'fast': '150ms',
        'DEFAULT': '200ms',
        'slow': '250ms',
      },
      transitionTimingFunction: {
        'ease': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
}
