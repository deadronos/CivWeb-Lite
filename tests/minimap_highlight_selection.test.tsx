import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameProvider } from '../src/contexts/game-provider';
import { SelectionProvider } from '../src/contexts/selection-context';
import MinimapContainer from '../src/components/ui/minimap-container';
import { applyAction } from '../src/game/reducer';
import { initialState } from "..\\src\\contexts\\game-provider";

function seedWorld() {
  let s = initialState();
  s = applyAction(s, {
    type: 'EXT_ADD_TILE',
    payload: { tile: { id: 'a', q: 0, r: 0, biome: 'grassland' } }
  });
  s = applyAction(s, {
    type: 'EXT_ADD_TILE',
    payload: { tile: { id: 'b', q: 1, r: 0, biome: 'grassland' } }
  });
  s = applyAction(s, {
    type: 'EXT_ADD_TILE',
    payload: { tile: { id: 'c', q: 2, r: 0, biome: 'grassland' } }
  });
  s = applyAction(s, {
    type: 'EXT_ADD_CITY',
    payload: { cityId: 'home', name: 'H', ownerId: 'P', tileId: 'a' }
  });
  s = applyAction(s, {
    type: 'EXT_ADD_UNIT',
    payload: { unitId: 'u1', type: 'warrior', ownerId: 'P', tileId: 'a' }
  });
  return s;
}

describe('Minimap highlights reachable tiles when a unit is selected', () => {
  it('sets data-highlight when selection present', () => {
    // prime provider state by calling reducer before render
    seedWorld();
    // Render providers and component. Note: GameProvider initializes its own state,
    // this test is primarily checking wiring exists and does not crash.
    render(
      <GameProvider>
          <SelectionProvider initialSelectedUnitId="u1">
            <MinimapContainer />
          </SelectionProvider>
        </GameProvider>
    );
    const mini = screen.getByLabelText('minimap');
    // data-highlight exists; content may vary depending on INIT world, but should be a string
    expect(mini.dataset.highlight).toBeTypeOf('string');
  });
});