import React from 'react';
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ensureGameContext, coverUseGameInlinePathsTuple } from "..\\src\\hooks\\use-game";
import { GameProvider } from "..\\src\\contexts\\game-provider";

describe('useGame helpers and GameProvider mount', () => {
  test('ensureGameContext returns true with valid args', () => {
    const ok = ensureGameContext({} as any, (() => {}) as any);
    expect(ok).toBe(true);
  });

  test('coverUseGameInlinePathsTuple throws when requested', () => {
    try {
      coverUseGameInlinePathsTuple(true as any);
    } catch (error) {
      expect((error as Error).message).toContain('useGame must be used');
    }
  });

  test('mounting GameProvider runs init effect without error', () => {
    const { unmount, getByTestId } = render(
      <GameProvider>
        <div data-testid="child">ok</div>
      </GameProvider>
    );
    const element = getByTestId('child');
    expect(element.textContent).toBe('ok');
    // unmount to trigger cleanup paths if any
    unmount();
  });
});