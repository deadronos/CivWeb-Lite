import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({ Canvas: () => null }));
vi.mock('@react-three/drei', () => ({ OrbitControls: () => null, Stats: () => null }));

import { UI } from '../src/App';
import { GameProvider } from '../src/contexts/GameProvider';

describe('UI inside provider', () => {
  it('renders UI component when mounted inside GameProvider', () => {
    const { getByText } = render(
      <GameProvider>
        <UI />
      </GameProvider>
    );
    // Turn text should be present
    expect(getByText(/Turn:/)).toBeTruthy();
  });
});
