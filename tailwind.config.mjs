/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#20466f',
          50: '#f0f4f8',
          100: '#d9e7f0',
          200: '#b3cfe1',
          300: '#8db7d2',
          400: '#679fc3',
          500: '#4187b4',
          600: '#20466f',
          700: '#1a3a5c',
          800: '#142e49',
          900: '#0e2236'
        },
        accent: {
          DEFAULT: '#ffd147',
          50: '#fffbf0',
          100: '#fff6d9',
          200: '#ffedb3',
          300: '#ffe48d',
          400: '#ffdb67',
          500: '#ffd147',
          600: '#e6bc40',
          700: '#cca739',
          800: '#b39232',
          900: '#997d2b'
        },
        success: {
          DEFAULT: '#10b981',
          50: '#f0fdf7',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#10b981',
          700: '#059669',
          800: '#047857',
          900: '#065f46'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px'
        }
      }
    },
  },
  plugins: [],
}