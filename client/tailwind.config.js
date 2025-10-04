/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New nature-inspired color palette
        primary: {
          50: '#f7f8f9',   // Lightest version of dark slate
          100: '#e8eaec',
          200: '#d1d5d9',
          300: '#a8b0b7',
          400: '#7d8994',
          500: '#4A5759',  // Main dark slate
          600: '#3e494b',
          700: '#323b3d',
          800: '#262d2f',
          900: '#1a1f21',
        },
        sage: {
          50: '#f7f8f7',
          100: '#eef0ee',
          200: '#dde1dd',
          300: '#c4ccc5',
          400: '#a5b1a6',
          500: '#B0C4B1',  // Main sage green
          600: '#9eb09f',
          700: '#8a9c8b',
          800: '#768876',
          900: '#5f6f60',
        },
        cream: {
          50: '#fefdfc',
          100: '#fdfaf8',
          200: '#faf5f0',
          300: '#f6ede5',
          400: '#f1e3d7',
          500: '#F7E1D7',  // Main cream
          600: '#e5c9b5',
          700: '#d2b193',
          800: '#bf9971',
          900: '#ac814f',
        },
        greige: {
          50: '#fafaf9',
          100: '#f4f4f2',
          200: '#e8e7e3',
          300: '#d9d7d1',
          400: '#c7c4bc',
          500: '#DEDBD2',  // Main greige
          600: '#c8c3b8',
          700: '#b2ab9e',
          800: '#9c9384',
          900: '#867b6a',
        },
        blush: {
          50: '#fdf7f8',
          100: '#faeeef',
          200: '#f4dce0',
          300: '#ebc2c8',
          400: '#e1a8b0',
          500: '#EDAFB8',  // Main light pink
          600: '#e19da6',
          700: '#d58b94',
          800: '#c97982',
          900: '#bd6770',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
