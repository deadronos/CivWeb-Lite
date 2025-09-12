import React from 'react';
import type { UnitSelectionOverlayProperties } from '../../game/types/ui';

/**
 * @file This file contains the UnitSelectionOverlay component, which displays information about the selected unit.
 */

/**
 * A component that displays information about the selected unit.
 * @param props - The component properties.
 * @returns The rendered component, or null if no unit is selected.
 */
export function UnitSelectionOverlay(properties: UnitSelectionOverlayProperties) {
  const { selectedUnitId, computedRangeTiles, computedPath, onPreviewPath, onIssueMove, onCancel } =
    properties;
  if (!selectedUnitId) return;
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
