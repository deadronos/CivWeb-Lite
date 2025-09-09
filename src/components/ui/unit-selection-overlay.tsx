import React from 'react';
import type { UnitSelectionOverlayProps as UnitSelectionOverlayProperties } from '../../game/types/ui';

export function UnitSelectionOverlay(properties: UnitSelectionOverlayProperties) {
  const { selectedUnitId, computedRangeTiles, computedPath, onPreviewPath, onIssueMove, onCancel } =
    properties;
  if (!selectedUnitId) return null;
  return (
    <div data-testid="unit-selection-overlay">
      <div>Unit: {selectedUnitId}</div>
      <div>Range: {computedRangeTiles.join(', ') || 'none'}</div>
      {computedPath && <div>Path: {computedPath.join(' -> ')}</div>}
      <div style={{ display: 'none' }}>
        {/* These callbacks are wired by parent; exposed for tests */}
        <button onClick={() => onPreviewPath('')}>preview</button>
        <button onClick={() => onIssueMove({ unitId: selectedUnitId, path: [] })}>move</button>
        <button onClick={onCancel}>cancel</button>
      </div>
    </div>
  );
}

export default UnitSelectionOverlay;
