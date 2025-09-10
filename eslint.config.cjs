// Minimal flat ESLint config for ESLint v9+.
// This intentionally avoids FlatCompat to reduce complexity and loads required plugins directly.
// Load unicorn recommended rules and lower them to 'warn' to opt-in gradually.
const _unicorn = require('eslint-plugin-unicorn');
const unicornPlugin = (_unicorn && _unicorn.default) ? _unicorn.default : _unicorn;
const unicornRecommended = (unicornPlugin && unicornPlugin.configs && unicornPlugin.configs.recommended && unicornPlugin.configs.recommended.rules) || {};
// Optionally prepare a selected subset of unicorn rules to enable at 'warn' level.
const unicornAllowlist = [
  'prefer-includes',
  'no-array-for-each',
  'no-nested-ternary',
  'no-useless-undefined',
  'prefer-array-index-of',
  'prefer-array-some',
  'prefer-at',
  'expiring-todo-comments',
  'no-empty-file',
];
const unicornSelectedWarned = Object.fromEntries(
  unicornAllowlist.filter((k) => unicornPlugin && unicornPlugin.rules && k in unicornPlugin.rules).map((k) => [`unicorn/${k}`, 'warn'])
);

// Take the plugin's recommended rules and lower them to 'warn', but only for rules
// that actually exist in the installed plugin. This avoids "Could not find ... in plugin"
// errors when plugin versions differ.
const unicornRecommendedLowered = Object.fromEntries(
  Object.keys(unicornRecommended || {}).filter((k) => {
    if (typeof k !== 'string') return false;
    if (!k.startsWith('unicorn/')) return false;
    const short = k.slice('unicorn/'.length);
    return unicornPlugin && unicornPlugin.rules && short in unicornPlugin.rules;
  }).map((k) => [k, 'warn'])
);

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
  unicorn: unicornPlugin,
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
  // Gradually enable a conservative subset of unicorn rules at 'warn' level.
  // We also spread the programmatically-lowered recommended rules (only those
  // that exist in the installed plugin) so the repo opts into the plugin's
  // recommended guidance at 'warn' without causing rule-not-found errors.
  // Note: keep explicit overrides above/below this spread if you want to
  // change severity for specific rules later.
  ...unicornSelectedWarned,
  ...unicornRecommendedLowered,

  // We avoid spreading the full recommended set directly to prevent rule resolution errors.
      'unicorn/prefer-includes': 'warn',
      'unicorn/no-array-for-each': 'warn',
      'unicorn/no-nested-ternary': 'warn',
      'unicorn/no-useless-undefined': 'warn',
      'unicorn/prefer-array-index-of': 'warn',
      'unicorn/prefer-array-some': 'warn',
      'unicorn/prefer-string-slice': 'warn',
      'unicorn/prefer-optional-catch-binding': 'warn',
      'unicorn/prefer-array-find': 'warn',
      // Next safe batch of unicorn rules enabled at 'warn'
      'unicorn/prefer-array-flat': 'warn',
      'unicorn/prefer-array-flat-map': 'warn',
      'unicorn/prefer-string-replace-all': 'warn',
      'unicorn/prefer-set-has': 'warn',
      // Next conservative batch: prefer modern built-ins and string APIs
      'unicorn/prefer-negative-index': 'warn',
      'unicorn/prefer-string-starts-ends-with': 'warn',
      'unicorn/prefer-string-trim-start-end': 'warn',
      'unicorn/prefer-object-from-entries': 'warn',
      // Batch 4: small safe modernizations
      'unicorn/prefer-spread': 'warn',
      'unicorn/require-array-join-separator': 'warn',
      'unicorn/prefer-global-this': 'warn',
      'unicorn/prefer-dom-node-text-content': 'warn',
      'unicorn/prefer-at': 'warn',
      'unicorn/expiring-todo-comments': 'warn',
      'unicorn/no-empty-file': 'warn',
  // Enforce kebab-case filenames across src by default
  // Lower to 'warn' during progressive migration so it does not fail CI/tests
  'unicorn/filename-case': ['warn', { cases: { kebabCase: true } }],
    },
  },

  // (no direct insertion of unicorn plugin configs to avoid plugin redefinition)

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

  // Temporary allowlist for legacy PascalCase filenames. New files must be kebab-case.
  {
    files: [
      'src/App.tsx',
      'src/components/common/LazySpinner.tsx',
      'src/components/overhaul/LeftCivicPanel.tsx',
      'src/components/overhaul/RightProductionPanel.tsx',
  // removed shim: 'src/components/ui/ContextPanel.tsx',
      'src/components/ui/Icon.tsx',
      'src/components/ui/Minimap.tsx',
    // TopBar/LeftPanel shims removed in safe batches; canonical kebab-case files are tracked instead
  // TopBar/LeftPanel shims removed in safe batches; canonical kebab-case files are tracked instead
  // removed PascalCase shim entries: game-hud, unit-selection-overlay-container
  // HoverContext/GameProvider/SelectionContext PascalCase shims removed from index; canonical kebab-case files are tracked
  'src/game/tech/tech-catalog.ts',
  // 'src/hooks/useCamera.tsx', (removed shim)
  // 'src/hooks/useGame.ts', (removed shim)
      'src/scene/InstancedTiles.tsx',
      'src/scene/Scene.tsx',
      'src/scene/TileMesh.tsx',
      'src/scene/UnitMarkers.tsx',
      'src/scene/UnitMeshes.tsx',
      'src/scene/drei/BillboardLabel.tsx',
      'src/scene/drei/CameraControls.tsx',
      'src/scene/drei/DevStats.tsx',
      'src/scene/drei/GLTFModel.tsx',
      'src/scene/drei/HtmlLabel.tsx',
      'src/scene/units/Bob.tsx',
      'src/scene/units/gltfRegistry.ts',
      'src/scene/units/modelRegistry.tsx',
      'src/scene/units/ProceduralPreload.tsx',
      // Additional legacy shims still present; keep these paths in the allowlist
  // legacy shims still present (to be removed in subsequent safe batches)
  // left-panel, minimap-container, next-turn-control-container, top-bar shims — keep in allowlist until filesystem
  // case-sensitive removals can be applied safely on CI or via git mv on case-sensitive FS.
  // LeftPanel, MinimapContainer, NextTurnControlContainer, TopBar, TopBarContainer removed in safe batch
    // contexts/game-provider.tsx and related kebab-case files are tracked instead
    ],
    // Turn off filename-case enforcement for these legacy shim files while they are being migrated
    rules: {
      'unicorn/filename-case': 'off',
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
      // Do not enforce filename case on legacy test filenames
      'unicorn/filename-case': 'off',
    },
  },

  // TopBar, TopBarContainer, SelectionContext shims removed in safe batch
    // (no rules block here)
];
