import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          light: 'rgb(var(--text-light) / <alpha-value>)',
          placeholder: 'rgb(var(--text-placeholder) / <alpha-value>)',
        },
        accent: {
          green: 'rgb(var(--accent-green) / <alpha-value>)',
          'green-dark': 'rgb(var(--accent-green-dark) / <alpha-value>)',
        },
        surface: 'rgb(var(--surface) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        dropdown: 'var(--shadow-dropdown)',
        button: 'var(--shadow-button)',
        'button-hover': 'var(--shadow-button-hover)',
      },
    },
  },
  plugins: [],
}

export default config
