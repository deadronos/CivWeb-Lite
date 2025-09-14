import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('src', import.meta.url));
const reactIconsMd = fileURLToPath(new URL('tests/__mocks__/react-icons-md.ts', import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'tests/**/*.spec.ts',
      'tests/**/*.spec.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**'],
      thresholds: {
        'src/game/**/*': {
          lines: 80,
          branches: 80,
          functions: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      src: source,
      'react-icons/md': reactIconsMd,
    },
  },
});
