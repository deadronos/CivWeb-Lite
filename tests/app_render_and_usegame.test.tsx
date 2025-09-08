import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock heavy 3D modules before importing App
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => React.createElement('div', { 'data-testid': 'canvas' }, children),
}));
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => React.createElement('div', { 'data-testid': 'orbit' }),
  Stats: () => React.createElement('div', { 'data-testid': 'stats' }),
}));

import App, { UIComponent } from '../src/App';
import { useGame } from '../src/hooks/useGame';
import { GameProvider } from '../src/contexts/GameProvider';

describe('App render and useGame exception', () => {
  it('renders App default without throwing (with mocks)', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('useGame throws when used outside provider', () => {
    function Bad() {
      // calling hook outside of provider should throw
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useGame();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(/useGame must be used within GameProvider/);
  });
});
