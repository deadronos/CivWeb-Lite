import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameProvider } from '../src/contexts/GameProvider';
import { SelectionProvider } from '../src/contexts/SelectionContext';
import { HoverProvider } from '../src/contexts/HoverContext';
import { ConnectedScene as Scene } from '../src/scene/Scene';

describe('Scene hovered tile tooltip', () => {
  it('renders HtmlLabel at hovered tile via custom event', async () => {
    render(
      <GameProvider>
        <SelectionProvider>
          <HoverProvider>
            <Scene />
          </HoverProvider>
        </SelectionProvider>
      </GameProvider>
    );

    // Simulate hovering tile index 0 via custom event used in dev/test
    globalThis.dispatchEvent(new CustomEvent('civweblite:hoverTileIndex', { detail: { index: 0 } }));

    const element = await screen.findByTestId('hovered-tile-label');
    expect(element).toBeDefined();
  });
});
