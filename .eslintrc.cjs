module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-comments', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    // Require a short description when disabling eslint rules inline
    'eslint-comments/require-description': ['warn', { ignore: [] }],
    'eslint-comments/no-unused-disable': 'error',
  // Basic security-oriented checks (from eslint-plugin-security)
  'security/detect-object-injection': 'off',
  },
  ignorePatterns: ['dist', 'node_modules'],
  overrides: [
    {
      files: ['src/game/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-properties': [
          'error',
          {
            object: 'Math',
            property: 'random',
            message: 'Use deterministic RNG from src/game/rng.ts',
          },
        ],
      },
    },
  ],
};
