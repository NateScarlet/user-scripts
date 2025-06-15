const { log } = require('console');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['components/*.ts'],
  plugins: ['tailwindcss/nesting'],
  theme: {
    fontSize: {
      xs: ['12px', '14px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['20px', '28px'],
      xl: ['24px', '32px'],
    },
  },
};
