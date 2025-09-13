import React from 'react';
import * as THREE from 'three';
import { primitive } from '@react-three/drei';
import { useGame } from '../../hooks/use-game';
import { UnitState } from '../../types/unit';

interface PathPreviewOverlayProperties {
  selectedUnitId?: string;
}

export function PathPreviewOverlay({ selectedUnitId }: PathPreviewOverlayProperties) {
  const { state } = useGame();

  if (!selectedUnitId || !state.ui.previewPath || state.ui.previewPath.length < 2) {
    return null;
  }

  const path = state.ui.previewPath;
  const extension = state.contentExt;

  if (!extension) return null;

  // Get unit current position
  const unit = extension.units[selectedUnitId];
  if (!unit) return null;

  return (
    <group data-testid="path-preview-overlay">
      {path.map((tileId, index) => {
        const tile = extension.tiles[tileId];
        if (!tile || index === 0) return null; // Skip first if it's current position

        const previousTileId = path[index - 1];
        const previousTile = extension.tiles[previousTileId];
        if (!previousTile) return null;

        // Convert hex to 3D positions
        const previousX = previousTile.q * Math.sqrt(3) * 0.5;
        const previousZ = (previousTile.r + previousTile.q * 0.5) * 1.5;
        const x = tile.q * Math.sqrt(3) * 0.5;
        const z = (tile.r + tile.q * 0.5) * 1.5;

        const direction = new THREE.Vector3(x - previousX, 0, z - previousZ).normalize();
        const length = Math.hypot(x - previousX, z - previousZ);

        const origin = new THREE.Vector3(previousX, 0.05, previousZ);

        const arrow = new THREE.ArrowHelper(direction, origin, length, 0x00ff00, 0.1, 0.05);

        return (
          <primitive
            key={`${previousTileId}-${tileId}`}
            object={arrow}
          />
        );
      })}
    </group>
  );
}

export default PathPreviewOverlay;
