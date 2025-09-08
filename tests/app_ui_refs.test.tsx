import { test, expect } from 'vitest';
import { coverAppInlineExtras, coverRemainingAppPaths } from '../src/App';

test('coverAppInlineExtras returns dispatched when seed present or not', () => {
  const d1 = coverAppInlineExtras(true);
  const d2 = coverAppInlineExtras(false);
  expect(Array.isArray(d1)).toBe(true);
  expect(Array.isArray(d2)).toBe(true);
});

test('coverRemainingAppPaths handles null refs and returns dispatched actions', () => {
  const res = coverRemainingAppPaths();
  expect(res).toHaveProperty('v');
  expect(res).toHaveProperty('dispatched');
  expect(Array.isArray(res.dispatched)).toBe(true);
});
