import React from 'react';
import { useGame } from '../hooks/use-game';
import { axialToWorld, DEFAULT_HEX_SIZE } from './utils/coords';

type Properties = {
  selectedUnitId?: string;
};

export const MovementPreview: React.FC<Properties> = ({ selectedUnitId }) => {
  const { state } = useGame();

  if (selectedUnitId === undefined) return null;
  const path = state.ui.previewPath;
  if (!path || !Array.isArray(path) || path.length === 0) return null;
  const lastTileId = path.at(-1)!;
  const tile = state.contentExt?.tiles?.[lastTileId];
  if (tile === undefined) return null;

  const [x, z] = axialToWorld(tile.q, tile.r, DEFAULT_HEX_SIZE);
  const posY = 0.6; // slightly above the tile

  // Simple ghost unit representation: semi-transparent cylinder
  return (
    <group data-testid="movement-preview">
      <mesh position={[x, posY, z]}>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 6]} />
        <meshStandardMaterial color={'#ffffff'} transparent opacity={0.45} depthWrite={false} />
      </mesh>
    </group>
  );
};

export default MovementPreview;
