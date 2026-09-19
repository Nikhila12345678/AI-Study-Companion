/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        // Distinct AI/tutor identity: deep indigo-violet as primary,
        // a warm amber accent as the "AI" signal color (not the same as
        // brand primary, so tutor moments read visually distinct).
        ink: '#14122B',
        surface: '#FBFAF7',
        panel: '#FFFFFF',
        brand: {
          50: '#F1EEFF', 100: '#E1DBFF', 200: '#C4B9FF', 300: '#A38FFF',
          400: '#8368FA', 500: '#6B4EF0', 600: '#5738D6', 700: '#442BAA',
          800: '#332180', 900: '#241760'
        },
        tutor: {
          light: '#FFF3E0', DEFAULT: '#E88A3B', dark: '#B4611D'
        },
        mastery: {
          low: '#E15B5B', mid: '#E0A72E', high: '#2FA372'
        }
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,18,43,0.04), 0 8px 24px -8px rgba(20,18,43,0.10)'
      }
    }
  },
  darkMode: 'class',
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        study: {
          primary: '#6B4EF0',
          'primary-content': '#FFFFFF',
          secondary: '#E88A3B',
          accent: '#2FA372',
          neutral: '#14122B',
          'base-100': '#FFFFFF',
          'base-200': '#F5F3FF',
          'base-300': '#E1DBFF',
          info: '#3B82C4',
          success: '#2FA372',
          warning: '#E0A72E',
          error: '#E15B5B'
        }
      }
    ]
  }
};
