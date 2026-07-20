/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand — calm, trustworthy teal
        brand: {
          50: '#effcf9',
          100: '#c9f5ec',
          200: '#96e9db',
          300: '#5dd6c5',
          400: '#2fbcaa',
          500: '#159e8f',
          600: '#0d8074',
          700: '#0f766e', // theme_color
          800: '#115e58',
          900: '#134e4a',
          950: '#042f2c',
        },
        // Deep navy ink used for text + dark surfaces
        ink: {
          50: '#f4f6fb',
          100: '#e7ebf5',
          200: '#c9d3e8',
          300: '#9daed3',
          400: '#6b82b5',
          500: '#4a6199',
          600: '#394d7f',
          700: '#2f3f67',
          800: '#1e293b',
          900: '#131c2e',
          950: '#0b1220', // background_color
        },
        // Status accents — instantly scannable
        paid: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        pending: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        overdue: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // Tabular numerals look cleaner for currency amounts
        num: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 18, 32, 0.04), 0 8px 24px -8px rgba(11, 18, 32, 0.12)',
        'card-hover': '0 2px 4px rgba(11, 18, 32, 0.06), 0 16px 40px -12px rgba(11, 18, 32, 0.22)',
        sheet: '0 -8px 40px -8px rgba(11, 18, 32, 0.25)',
        fab: '0 8px 24px -4px rgba(15, 118, 110, 0.45)',
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
}
