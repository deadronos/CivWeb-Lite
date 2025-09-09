import React from 'react';
import Minimap from './Minimap';
import { useGame } from '../../hooks/useGame';
import { useSelection } from '../../contexts/SelectionContext';
import { computeMovementRange } from '../../game/pathfinder';
import { useCamera } from '../../hooks/useCamera';

export default function MinimapContainer() {
  const { state } = useGame();
  const { selectedUnitId } = useSelection();
  const camera = useCamera();
  const onPickCoord = React.useCallback((coord: { q: number; r: number }) => {
    camera.centerOn(coord);
  }, [camera]);
  const ext = state.contentExt;
  const highlighted = React.useMemo(() => {
    if (!ext || !selectedUnitId) return [] as string[];
    try {
      return computeMovementRange(ext, selectedUnitId).reachable;
    } catch {
      return [] as string[];
    }
  }, [ext, selectedUnitId]);
  return (
    <Minimap
      width={state.map.width}
      height={state.map.height}
      onPickCoord={onPickCoord}
      highlightedTileIds={highlighted}
    />
  );
}