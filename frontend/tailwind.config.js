/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          dark: '#0056CC',
          light: '#47A1FF'
        },
        success: {
          DEFAULT: '#34C759',
          light: '#E3F2E7'
        },
        error: {
          DEFAULT: '#FF3B30',
          light: '#FFE5E5'
        },
        warning: {
          DEFAULT: '#FF9500',
          light: '#FFF0D9'
        },
        neutral: {
          50: '#F2F2F7',
          100: '#FFFFFF',
          200: '#E5E5EA',
          300: '#C7C7CC',
          400: '#8E8E93',
          500: '#3A3A3C',
          900: '#1C1C1E'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace']
      },
      fontSize: {
        'xs': ['13px', { lineHeight: '18px' }],
        'sm': ['15px', { lineHeight: '20px' }],
        'base': ['17px', { lineHeight: '22px' }],
        'lg': ['20px', { lineHeight: '24px' }],
        'xl': ['24px', { lineHeight: '28px' }],
        '2xl': ['28px', { lineHeight: '32px' }],
        '3xl': ['34px', { lineHeight: '40px' }]
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px'
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'full': '9999px'
      },
      animation: {
        'fade-in': 'fadeIn 300ms cubic-bezier(0, 0, 0.2, 1)',
        'fade-out': 'fadeOut 300ms cubic-bezier(0.4, 0, 1, 1)',
        'slide-up': 'slideUp 400ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.2, 0.9, 0.3, 1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0', visibility: 'hidden' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: [],
}