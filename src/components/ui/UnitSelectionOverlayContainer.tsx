import React, { useMemo, useState } from 'react';
import { useGame } from '../../hooks/useGame';
import { UnitSelectionOverlay } from './UnitSelectionOverlay';
import { computePath, computeMovementRange } from '../../game/pathfinder';

export function UnitSelectionOverlayContainer({
  selectedUnitId,
}: {
  selectedUnitId: string | null;
}) {
  const { state, dispatch } = useGame();
  const ext = state.contentExt;
  const [path, setPath] = useState<string[] | undefined>();

  const range = useMemo(() => {
    if (!ext || !selectedUnitId) return { reachable: [], cost: {} as Record<string, number> };
    return computeMovementRange(ext, selectedUnitId);
  }, [ext, selectedUnitId]);

  if (!selectedUnitId || !ext) return null;

  return (
    <UnitSelectionOverlay
      selectedUnitId={selectedUnitId}
      computedRangeTiles={range.reachable}
      computedPath={path}
      onPreviewPath={(targetTileId) => {
        if (!ext) return;
        const res = computePath(ext, selectedUnitId, targetTileId);
        if ('path' in res && res.path) setPath(res.path);
        else setPath(undefined);
      }}
      onIssueMove={(payload) => dispatch({ type: 'EXT_ISSUE_MOVE_PATH', payload })}
      onCancel={() => setPath(undefined)}
    />
  );
}

export default UnitSelectionOverlayContainer;
