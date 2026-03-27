import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF6F1',
          100: '#FAF3EA',
          200: '#F3E4C9',
          300: '#E8DDD3',
          400: '#C4B5A6',
          500: '#B8A898',
          600: '#A98B76',
          700: '#96796A',
          800: '#8B7261',
          900: '#7A6A5C',
        },
        text: {
          primary: '#3D3127',
          secondary: '#5C4A3A',
          muted: '#9A8A7C',
          light: '#B8A898',
          placeholder: '#C4B5A6',
        },
        accent: {
          green: '#BABF94',
          'green-dark': '#7A8A50',
        },
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
        card: '0 4px 24px rgba(169, 139, 118, 0.12)',
        dropdown: '0 8px 30px rgba(169, 139, 118, 0.18)',
        button: '0 2px 8px rgba(169, 139, 118, 0.3)',
        'button-hover': '0 4px 12px rgba(169, 139, 118, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
