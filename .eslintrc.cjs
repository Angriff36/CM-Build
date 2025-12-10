module.exports = {
  root: true,
  env: {
    es2023: true,
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'turbo', 'prettier'],
  ignorePatterns: ['node_modules', 'dist', '.turbo', 'coverage'],
  rules: {}
};