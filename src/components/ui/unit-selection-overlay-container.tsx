import React, { useMemo } from 'react';
import { useGame } from '../../hooks/use-game';
import { UnitSelectionOverlay } from './unit-selection-overlay';
import { computeMovementRange } from '../../game/pathfinder';

export function UnitSelectionOverlayContainer({ selectedUnitId }: { selectedUnitId?: string }) {
  const { state, dispatch } = useGame();
  const extension = state.contentExt;
  
  // Use the preview path from UI state instead of local state
  const previewPath = state.ui.previewPath;

  const range = useMemo(() => {
    if (!extension || !selectedUnitId) return { reachable: [], cost: {} as Record<string, number> };
    return computeMovementRange(extension, selectedUnitId, state.map.width, state.map.height);
  }, [extension, selectedUnitId, state.map.height, state.map.width]);

  if (!selectedUnitId || !extension) return;

  return (
    <UnitSelectionOverlay
      selectedUnitId={selectedUnitId}
      computedRangeTiles={range.reachable}
      computedPath={previewPath}
      onPreviewPath={(targetTileId) => {
        dispatch({ type: 'PREVIEW_PATH', payload: { unitId: selectedUnitId, targetTileId } });
      }}
      onIssueMove={(payload) => {
        dispatch({ type: 'ISSUE_MOVE', payload });
      }}
      onCancel={() => {
        dispatch({ type: 'CANCEL_SELECTION', payload: { unitId: selectedUnitId } });
      }}
    />
  );
}

export default UnitSelectionOverlayContainer;
