// Minimal flat ESLint config for ESLint v9+.
// This intentionally avoids FlatCompat to reduce complexity and loads required plugins directly.
module.exports = [
  {
    ignores: ['dist', 'node_modules'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      // Do not set `parserOptions.project` globally because many repo files (tests, scripts)
      // are not included in the root tsconfig and will cause the parser to error.
      // We add a specific override (below) that enables `project` for `src/` files only.
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: {} },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
      import: require('eslint-plugin-import'),
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
      'testing-library': require('eslint-plugin-testing-library'),
      vitest: require('eslint-plugin-vitest'),
      playwright: require('eslint-plugin-playwright'),
      unicorn: require('eslint-plugin-unicorn'),
      sonarjs: require('eslint-plugin-sonarjs'),
      promise: require('eslint-plugin-promise'),
      'eslint-comments': require('eslint-plugin-eslint-comments'),
      security: require('eslint-plugin-security'),
    },
    rules: {
      // keep previous project defaults
      '@typescript-eslint/no-explicit-any': 'off',
      'eslint-comments/require-description': ['warn', { ignore: [] }],
      'eslint-comments/no-unused-disable': 'error',
      'security/detect-object-injection': 'off',
    },
  },

  // Enable type-aware linting only for src/ (where tsconfig.json applies).
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaFeatures: { jsx: true },
      },
    },
    // Re-use same plugin to make rules available in this override
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
  },

  // Test files override (vitest/playwright/testing-library)
  {
    files: ['**/*.test.{ts,tsx}', 'tests/**', 'playwright/**', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: { vitest: 'readonly' },
    },
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // Game-specific rule: forbid Math.random in src/game
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
];
