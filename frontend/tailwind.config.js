/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sahayak: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#15803d',
          600: '#166534',
          700: '#14532d',
          teal: '#0f766e',
          saffron: '#ea580c',
          navy: '#0f172a',
          emergency: '#dc2626'
        },
        // Dedicated high-contrast accessibility tokens
        hc: {
          bg: '#000000',
          surface: '#121212',
          text: '#ffff00', // Yellow on black - gold standard for low vision
          textSecondary: '#ffffff',
          border: '#ffff00',
          buttonBg: '#ffff00',
          buttonText: '#000000',
          sos: '#ff0000'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
