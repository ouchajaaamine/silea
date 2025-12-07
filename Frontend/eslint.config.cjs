module.exports = [
  {
    ignores: ['**/node_modules/**', '.next/**'],
  },
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
]
