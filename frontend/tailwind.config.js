/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B3A5C',
          50: '#F0F5FA',
          100: '#E1EBF5',
          200: '#C3D7EB',
          300: '#95BCE0',
          400: '#5F99CE',
          500: '#387BBA',
          600: '#2A639B',
          700: '#224F7C',
          800: '#1B3A5C', // Brand Primary
          900: '#13283F',
          950: '#0C1A29',
        },
        marigold: {
          DEFAULT: '#F5A623', // Brand Accent
          50: '#FEF8EE',
          100: '#FDF1DC',
          200: '#FAE2B8',
          300: '#F7CE89',
          400: '#F5A623',
          500: '#E28E0D',
          600: '#C07107',
          700: '#985108',
          800: '#7A3F0E',
          900: '#64340F',
        },
        cardbg: '#F3F6F9',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '8px',
        '2xl': '8px',
        '3xl': '8px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(27, 58, 92, 0.08), 0 1px 2px -1px rgba(27, 58, 92, 0.08)',
        'md': '0 2px 6px -1px rgba(27, 58, 92, 0.08)',
      }
    },
  },
  plugins: [],
}
