import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameProvider } from "../src/contexts/game-provider";
import { SelectionProvider } from "../src/contexts/selection-context";
import { HoverProvider } from "../src/contexts/hover-context";
import { useGame } from "../src/hooks/use-game";
import { ConnectedScene as Scene } from "../src/scene/scene";

const Adder: React.FC<{unitId: string;}> = ({ unitId }) => {
  const { dispatch } = useGame();
  React.useEffect(() => {
    dispatch({
      type: 'EXT_ADD_UNIT',
      payload: { unitId, type: 'warrior', ownerId: 'p1', tileId: 'hex_0_0' }
    });
  }, [dispatch, unitId]);
  return null;
};

describe('Scene selected unit label', () => {
  it('renders HtmlLabel for selected unit', async () => {
    render(
      <GameProvider>
        <SelectionProvider initialSelectedUnitId={'u_test'}>
          <HoverProvider>
            <Adder unitId="u_test" />
            <Scene />
          </HoverProvider>
        </SelectionProvider>
      </GameProvider>
    );
    const element = await screen.findByTestId('selected-unit-label');
    expect(element).toBeDefined();
  });
});