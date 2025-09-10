import React, { useMemo, useState } from 'react';
import { useGame } from "..\\..\\hooks\\use-game";
import { UnitSelectionOverlay } from "./unit-selection-overlay";
import { computePath, computeMovementRange } from '../../game/pathfinder';

export function UnitSelectionOverlayContainer({
  selectedUnitId

}: {selectedUnitId?: string;}) {
  const { state, dispatch } = useGame();
  const extension = state.contentExt;
  const [path, setPath] = useState<string[] | undefined>();

  const range = useMemo(() => {
    if (!extension || !selectedUnitId) return { reachable: [], cost: {} as Record<string, number> };
    return computeMovementRange(extension, selectedUnitId);
  }, [extension, selectedUnitId]);

  if (!selectedUnitId || !extension) return;

  return (
    <UnitSelectionOverlay
      selectedUnitId={selectedUnitId}
      computedRangeTiles={range.reachable}
      computedPath={path}
      onPreviewPath={(targetTileId) => {
        if (!extension) return;
        const result = computePath(extension, selectedUnitId, targetTileId);
        if ('path' in result && result.path) setPath(result.path);else
        setPath(undefined);
      }}
      onIssueMove={(payload) => dispatch({ type: 'EXT_ISSUE_MOVE_PATH', payload })}
      onCancel={() => setPath(undefined)} />);


}

export default UnitSelectionOverlayContainer;