module.exports = {
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
    },
  },
  variants: {
    extend: {
      textColor: ['visited'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
