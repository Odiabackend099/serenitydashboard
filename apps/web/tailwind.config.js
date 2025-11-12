/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        healthcare: {
          // Primary colors
          primary: '#0066CC',
          'primary-dark': '#0052A3',
          secondary: '#00A896',
          'secondary-dark': '#008577',
          accent: '#4A90E2',

          // Status colors
          success: '#52C41A',
          warning: '#FAAD14',
          error: '#F5222D',
          info: '#1890FF',

          // Light mode backgrounds
          'bg-primary': '#FAFBFC',
          'bg-secondary': '#F5F7FA',
          'bg-elevated': '#FFFFFF',

          // Dark mode backgrounds
          'dark-bg-primary': '#1A1D23',
          'dark-bg-secondary': '#23262E',
          'dark-bg-elevated': '#2A2D35',

          // Text colors
          'text-primary': '#1F2937',
          'text-secondary': '#6B7280',
          'text-muted': '#9CA3AF',
          'dark-text-primary': '#E5E7EB',
          'dark-text-secondary': '#9CA3AF',
          'dark-text-muted': '#6B7280',
        }
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideInFromRight: {
          from: { opacity: '0', transform: 'translateX(10px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        slideInFromRight: 'slideInFromRight 0.3s ease-out',
        fadeIn: 'fadeIn 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear'
      }
    }
  },
  plugins: []
};