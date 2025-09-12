import React from 'react';
import Minimap from './minimap';
import { useGame } from '../../hooks/use-game';
import { useSelection } from '../../contexts/selection-context';
import { computeMovementRange } from '../../game/pathfinder';
import { useCamera } from '../../hooks/use-camera';

/**
 * @file This file contains the MinimapContainer component, which is a container for the Minimap component.
 */

/**
 * A container component for the Minimap component.
 * It fetches the map data and highlighted tiles from the game state and passes them to the Minimap component.
 * @returns The rendered component.
 */
export default function MinimapContainer() {
  const { state } = useGame();
  // useSelection may throw if not wrapped in provider in some tests; guard safely.
  let selectedUnitId: string | undefined;
  try {
    selectedUnitId = useSelection()?.selectedUnitId ?? undefined;
  } catch {
    // tests may not include SelectionProvider; fall back to undefined
    selectedUnitId = undefined;
  }
  const camera = useCamera();
  const onPickCoord = React.useCallback(
    (coord: { q: number; r: number }) => {
      camera.centerOn(coord);
    },
    [camera]
  );
  const extension = state.contentExt;
  const highlighted = React.useMemo(() => {
    if (!extension || !selectedUnitId) return [] as string[];
    try {
      return computeMovementRange(extension, selectedUnitId, state.map.width, state.map.height)
        .reachable;
    } catch {
      return [] as string[];
    }
  }, [extension, selectedUnitId, state.map.height, state.map.width]);
  return (
    <Minimap
      width={state.map.width}
      height={state.map.height}
      onPickCoord={onPickCoord}
      highlightedTileIds={highlighted}
    />
  );
}
