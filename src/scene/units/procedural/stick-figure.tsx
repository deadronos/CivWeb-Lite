 
import React from 'react';
import { getBox, getCone, getCylinder, getSphere, getTorus } from './shared';

export type StickFigureOptions = {
  teamColor?: string;
  height?: number;
  accessories?: {
    spear?: boolean;
    staff?: boolean;
    backpack?: boolean;
    hammer?: boolean;
    bow?: boolean;
    arrow?: boolean;
  };
};

// Keep this component small and self-contained. Use React.FC for clearer typing.
export const StickFigure: React.FC<StickFigureOptions> = ({
  teamColor = '#bdc3c7',
  height = 1.6,
  accessories = {},
}) => {
  const scale = height / 1.6;
  const headY = 1.2 * scale;
  const torsoY = 0.6 * scale;
  const legY = 0.1 * scale;

  return (
    <group>
      {/* Head */}
      <mesh position={[0, headY, 0]} geometry={getSphere(0.18 * scale, 16, 16)}>
        <meshStandardMaterial color="#f4d1b5" />
      </mesh>

      {/* Torso */}
      <mesh position={[0, torsoY, 0]} geometry={getBox(0.35 * scale, 0.6 * scale, 0.18 * scale)}>
        <meshStandardMaterial color={teamColor} />
      </mesh>

      {/* Arms */}
      <mesh
        position={[0.25 * scale, torsoY + 0.1 * scale, 0]}
        rotation={[0, 0, Math.PI / 18]}
        geometry={getCylinder(0.04 * scale, 0.04 * scale, 0.6 * scale, 8)}
      >
        <meshStandardMaterial color="#d0c6c1" />
      </mesh>
      <mesh
        position={[-0.25 * scale, torsoY + 0.1 * scale, 0]}
        rotation={[0, 0, -Math.PI / 18]}
        geometry={getCylinder(0.04 * scale, 0.04 * scale, 0.6 * scale, 8)}
      >
        <meshStandardMaterial color="#d0c6c1" />
      </mesh>

      {/* Legs */}
      <mesh
        position={[0.12 * scale, legY, 0]}
        rotation={[0, 0, Math.PI / 48]}
        geometry={getCylinder(0.05 * scale, 0.05 * scale, 0.7 * scale, 8)}
      >
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      <mesh
        position={[-0.12 * scale, legY, 0]}
        rotation={[0, 0, -Math.PI / 48]}
        geometry={getCylinder(0.05 * scale, 0.05 * scale, 0.7 * scale, 8)}
      >
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {/* Accessories */}
      {accessories.spear && (
        <group position={[0.35 * scale, torsoY + 0.12 * scale, 0]} rotation={[0, 0, Math.PI / 16]}>
          <mesh geometry={getCylinder(0.03 * scale, 0.03 * scale, 1.6 * scale, 8)}>
            <meshStandardMaterial color="#8b5a2b" />
          </mesh>
          <mesh position={[0, 0.9 * scale, 0]} geometry={getCone(0.08 * scale, 0.18 * scale, 8)}>
            <meshStandardMaterial color="#95a5a6" />
          </mesh>
        </group>
      )}
      {accessories.staff && (
        <group position={[-0.35 * scale, torsoY + 0.18 * scale, 0]}>
          <mesh geometry={getCylinder(0.03 * scale, 0.03 * scale, 1.4 * scale, 8)}>
            <meshStandardMaterial color="#8b5a2b" />
          </mesh>
        </group>
      )}
      {accessories.backpack && (
        <mesh position={[0, torsoY, -0.12 * scale]}>
          <boxGeometry args={[0.28 * scale, 0.4 * scale, 0.12 * scale]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
      )}
      {accessories.hammer && (
        <group position={[0.35 * scale, torsoY + 0.12 * scale, 0]}>
          <mesh geometry={getCylinder(0.02 * scale, 0.02 * scale, 0.5 * scale, 8)}>
            <meshStandardMaterial color="#8b5a2b" />
          </mesh>
          <mesh position={[0, 0.25 * scale, 0]}>
            <boxGeometry args={[0.28 * scale, 0.12 * scale, 0.14 * scale]} />
            <meshStandardMaterial color="#95a5a6" />
          </mesh>
        </group>
      )}

      {/* Optional bow accessory: thin torus arc + string */}
      {accessories.bow && (
        <group position={[0.35 * scale, torsoY + 0.2 * scale, 0]} rotation={[0, 0, Math.PI / 12]}>
          <mesh geometry={getTorus(0.22 * scale, 0.015 * scale, 8, 14, Math.PI * 0.9)}>
            <meshStandardMaterial color="#8b5a2b" />
          </mesh>
          <mesh
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            geometry={getCylinder(0.005 * scale, 0.005 * scale, 0.42 * scale, 6)}
          >
            <meshStandardMaterial color="#ecf0f1" />
          </mesh>
          {accessories.arrow && (
            <group>
              <mesh
                position={[0, 0.05 * scale, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                geometry={getCylinder(0.006 * scale, 0.006 * scale, 0.32 * scale, 6)}
              >
                <meshStandardMaterial color="#7f8c8d" />
              </mesh>
              <mesh
                position={[0, 0.22 * scale, 0]}
                geometry={getCone(0.02 * scale, 0.06 * scale, 8)}
              >
                <meshStandardMaterial color="#95a5a6" />
              </mesh>
            </group>
          )}
        </group>
      )}
    </group>
  );
};

export default StickFigure;
