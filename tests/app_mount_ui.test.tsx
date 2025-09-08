import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { GameProvider } from '../src/contexts/GameProvider';
import { UI } from '../src/App';

describe('Mount UI inside GameProvider', () => {
  test('UI renders turn and map info when mounted inside provider', async () => {
    render(
      <GameProvider>
        <UI />
      </GameProvider>
    );

    // UI shows 'Turn:' and 'Map:' text nodes; ensure they exist
    const turnText = await screen.findByText(/Turn:/i);
    expect(turnText).toBeDefined();
    const mapText = await screen.findByText(/Map:/i);
    expect(mapText).toBeDefined();
  });
});
