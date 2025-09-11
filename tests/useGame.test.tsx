import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useGame } from '../src/hooks/use-game';

function BadConsumer() {
  // calling hook outside provider should throw
  useGame();
  return null;
}

describe('useGame hook', () => {
  it('throws when used outside GameProvider', () => {
    expect(() => render(<BadConsumer />)).toThrow();
  });
});
