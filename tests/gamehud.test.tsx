import { render, fireEvent } from '@testing-library/react';
import { GameProvider } from '../src/contexts/GameProvider';
import GameHUD from '../src/components/GameHUD';
import { vi } from 'vitest';

describe('GameHUD', () => {
  test('toggles auto simulation and regenerates seed', () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0);
    const { getByText } = render(
      <GameProvider>
        <GameHUD />
      </GameProvider>
    );
    const toggle = getByText('Start');
    fireEvent.click(toggle);
    expect(toggle.textContent).toBe('Pause');

    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const seedDisplay = getByText(/Seed:/);
    fireEvent.click(getByText('Regenerate Seed'));
    expect(seedDisplay.textContent).not.toContain('default');
  });
});
