module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module'
  },
  ignorePatterns: [
    'lib/**/*', // Ignore built files.
    'generated/**/*', // Ignore generated files.
    'jest.config.*'
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'import/no-unresolved': 0,
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    'object-curly-spacing': ['error', 'always'],
    'max-len': 0,
    'quote-props': 0,
    'require-jsdoc': 0,
    semi: 0,
    quotes: 0,
    indent: 0,
    'no-undef': 0
  },
  overrides: [
    {
      files: ['lib/**/*.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-undef': 'off'
      }
    }
  ]
}
