module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        usfGreen: '#006747',
        usfGold: '#CFC493',
        usfSand: '#EDEBD1',
        usfEvergreen: '#005432',
      },
      maxWidth: {
        '20': '5rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
