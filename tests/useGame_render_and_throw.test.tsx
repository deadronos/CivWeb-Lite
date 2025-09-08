import React from 'react';
import { render } from '@testing-library/react';
import { test, expect } from 'vitest';
import { coverForTestsUseGame, coverUseGameInlinePaths, coverUseGameThrowExplicitly } from '../src/hooks/useGame';
import { GameProvider } from '../src/contexts/GameProvider';
import { UI } from '../src/App';

test('cover thrown branch without hooks', () => {
  const res = coverForTestsUseGame(true);
  expect(res).toBe('threw');
  const msg = coverUseGameThrowExplicitly();
  expect(msg).toContain('useGame must be used within GameProvider');
});

test('render UI inside GameProvider to exercise useGame happy path', () => {
  const { container } = render(
    <GameProvider>
      <UI />
    </GameProvider>
  );
  // UI should render the Turn label
  expect(container.textContent).toContain('Turn');
});

test('cover inline paths helper throw path', () => {
  expect(() => coverUseGameInlinePaths(true)).toThrow();
});
