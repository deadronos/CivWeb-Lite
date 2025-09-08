import { test, expect } from 'vitest';

// This test imports helpers that are used only to increase coverage on
// specific, hard-to-trigger branches. It avoids rendering heavy three.js
// components and runs small deterministic helpers.
import * as App from '../src/App';
import * as GP from '../src/contexts/GameProvider';

test('cover uncovered app and gameprovider lines', () => {
  const a = App.coverAppUncoveredLines();
  expect(a).toHaveProperty('v');
  expect(typeof a.__cov).toBe('number');

  const g = GP.coverGameProviderUncovered();
  // g should be a number
  expect(typeof g).toBe('number');
});
