const { log } = require('console');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['components/*.ts'],
  important: '[data-a5b54b00-df07-432b-88ee-b0e6ac1062f2]',
  plugins: ['tailwindcss/nesting'],
  theme: {
    fontSize: {
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['20px', '28px'],
      xl: ['24px', '32px'],
    },
  },
};
