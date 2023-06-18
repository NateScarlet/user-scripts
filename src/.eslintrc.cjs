module.exports = {
  root: true,
  extends: [
    "plugin:import/typescript",
    "eslint:recommended",
    "airbnb-base",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:prettier/recommended",
  ],
  env: {
    greasemonkey: true,
    browser: true,
    es6: true,
  },
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: __dirname,
      },
    },
  },
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "PrivateIdentifier",
        message: "use TypeScript visibility annotations instead",
      },
      {
        selector:
          "MethodDefinition[kind=method]:matches(:not([accessibility]),[accessibility=public])",
        message:
          "use instance function and non-public method instead\nhttps://github.com/Microsoft/TypeScript/wiki/%27this%27-in-TypeScript#use-instance-functions",
      },
    ],
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
    "max-classes-per-file": ["error", { ignoreExpressions: true, max: 1 }],
    // not good when implementing a interface
    "class-methods-use-this": "off",
    "require-atomic-updates": "off", // https://github.com/eslint/eslint/issues/11899
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
        overrides: {
          methods: "off",
          constructors: "off",
          accessors: "off",
        },
      },
    ],
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    // typescript handled rules
    "grouped-accessor-pairs": "off",
    "no-shadow": "off",
    "no-useless-constructor": "off",
    "no-unused-vars": "off",
    "no-undef": "off",
    "no-empty-function": "off",
    "consistent-return": "off",
    "vue/return-in-computed-property": "off",
    "default-param-last": "off",
    "no-bitwise": "off",
    "import/no-import-module-exports": "off",
    "vue/require-default-prop": "off",
  },
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