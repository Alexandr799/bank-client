// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
    'cypress/globals': true,
  },
  extends: ['eslint:recommended', 'prettier', 'plugin:cypress/recommended'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['prettier', 'cypress'],
  rules: {
    'prettier/prettier': 'error',
    'cypress/no-unnecessary-waiting': 'warn',
  },
};
