import React from 'react';
import { useGame } from '../hooks/use-game';
import { axialToWorld, DEFAULT_HEX_SIZE } from './utils/coords';
import { Html } from '@react-three/drei';

type Properties = {
  selectedUnitId?: string;
};

export const MovementPreview: React.FC<Properties> = ({ selectedUnitId }) => {
  const { state } = useGame();

  if (selectedUnitId === undefined) return;
  const path = state.ui.previewPath;
  if (!path || !Array.isArray(path) || path.length === 0) return;
  const lastTileId = path.at(-1)!;
  const tile = state.contentExt?.tiles?.[lastTileId];
  if (tile === undefined) return;

  const [x, z] = axialToWorld(tile.q, tile.r, DEFAULT_HEX_SIZE);
  const posY = 0.6; // slightly above the tile

  // Simple ghost unit representation: semi-transparent cylinder
  // Expose computed world coords via a hidden DOM node (Html) so tests can
  // query data attributes without passing data-* props to three.js objects
  const dataX = x.toFixed(4);
  const dataZ = z.toFixed(4);
  return (
    <group>
      <mesh position={[Number(dataX), posY, Number(dataZ)]}>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 6]} />
        <meshStandardMaterial color={'#ffffff'} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* Html mounts a DOM node into the document so tests can find data attributes
          without attaching them directly to three objects (which caused runtime errors). */}
      <Html center style={{ pointerEvents: 'none' }}>
        <div
          data-testid="movement-preview"
          data-x={dataX}
          data-z={dataZ}
            // In test/dev environments we make the helper visible and give it a
            // small size so Playwright considers it "visible". In production it
            // remains hidden via CSS.
            style={
              (globalThis as any).__civweblite_test_helpers
                ? { display: 'block', width: '8px', height: '8px', background: 'rgba(255,0,0,0.6)' }
                : { display: 'none' }
            }
          className="movement-preview-dom-helper"
        />
      </Html>
    </group>
  );
};

export default MovementPreview;
