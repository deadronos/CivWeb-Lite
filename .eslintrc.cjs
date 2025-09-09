module.exports = {
  env: { browser: true, es2021: true },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'eslint-comments',
    'security',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'simple-import-sort',
    'testing-library',
    'vitest',
    'playwright',
    'unicorn',
    'sonarjs',
    'promise',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:testing-library/react',
    'plugin:vitest/recommended',
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
  settings: {
    react: { version: 'detect' },
    'import/resolver': { typescript: {} },
  },
  ignorePatterns: ['dist', 'node_modules'],
  overrides: [
    // Tests: vitest, testing-library, playwright rules
    {
      files: ['**/*.test.{ts,tsx}', 'tests/**', 'playwright/**', '**/*.spec.{ts,tsx}'],
      env: { vitest: true },
      plugins: ['testing-library', 'vitest', 'playwright'],
      extends: ['plugin:testing-library/react', 'plugin:vitest/recommended'],
      rules: {
        // allow dev-only imports in tests
        'import/no-extraneous-dependencies': 'off',
      },
    },
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
    // Small override for JS files where type-aware rules aren't necessary
    {
      files: ['scripts/**', 'playwright/**'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
