import React from 'react';
import { useGame } from '../../hooks/use-game';
import TopBar from './top-bar';

/**
 * @file This file contains the TopBarContainer component, which is a container for the TopBar component.
 */

/**
 * Opens the load modal.
 */
function openLoad() {
  globalThis.dispatchEvent(new Event('hud:openLoad'));
}

/**
 * Opens the load modal with the text area focused.
 */
function openLoadPaste() {
  globalThis.dispatchEvent(new Event('hud:openLoad:paste'));
}

/**
 * A container component for the TopBar component.
 * It fetches the game data and passes it to the TopBar component.
 * @returns The rendered component.
 */
export default function TopBarContainer() {
  const { state } = useGame();
  const human = state.players.find((p) => p.isHuman);
  const resources = React.useMemo(() => {
    return {
      science: human?.sciencePoints ?? 0,
      culture: human?.culturePoints ?? 0,
    } as const;
  }, [human]);

  return (
    <TopBar
      turn={state.turn}
      resources={resources}
      onOpenLoad={openLoad}
      onOpenLoadPaste={openLoadPaste}
    />
  );
}
