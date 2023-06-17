const { resolve } = require("path");

module.exports = {
  root: true,
  extends: [
    "plugin:import/typescript",
    "eslint:recommended",
    "airbnb-base",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  env: {
    greasemonkey: true,
    browser: true,
    es6: true,
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: resolve(__dirname),
      },
    },
  },
  rules: {
    "import/extensions": [
      "error",
      "always",
      {
        js: "never",
        mjs: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    camelcase: ["error", { allow: ["^\\$_"] }],
    "no-param-reassign": ["error", { props: false }],
    // not good when implementing a interface
    "class-methods-use-this": "off",
    "require-atomic-updates": "off", // https://github.com/eslint/eslint/issues/11899
    "@typescript-eslint/no-namespace": "off",
    // typescript handled rules
    "grouped-accessor-pairs": "off",
    "no-shadow": "off",
    "no-unused-vars": "off",
    "no-undef": "off",
    "consistent-return": "off",
    "vue/return-in-computed-property": "off",
    "default-param-last": "off",
    "no-bitwise": "off",
    "import/no-import-module-exports": "off",
    "vue/require-default-prop": "off",
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
    {
      files: ["*.ts"],
      rules: {
        "no-undef": "off",
        "no-inner-declarations": "off",
      },
    },
  ],
};
