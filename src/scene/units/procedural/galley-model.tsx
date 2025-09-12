import React from 'react';
import { getBox, getCylinder } from './shared';

/**
 * @file This file contains the GalleyModel component, which is a procedural model for the galley unit.
 */

/**
 * A procedural model for the galley unit.
 * @param props - The component properties.
 * @param props.teamColor - The color of the team.
 * @returns The rendered component.
 */
export function GalleyModel({ teamColor = '#2980b9' }: { teamColor?: string }) {
  // Simple boat: hull + mast + sail placeholder
  return (
    <group>
      {/* Hull */}
      <mesh rotation={[0, 0, 0]} geometry={getBox(0.9, 0.18, 0.35)}>
        <meshStandardMaterial color={teamColor} />
      </mesh>
      {/* Prow/Stern hints */}
      <mesh
        position={[0.45, 0, 0]}
        rotation={[0, 0, Math.PI / 12]}
        geometry={getBox(0.2, 0.08, 0.32)}
      >
        <meshStandardMaterial color={teamColor} />
      </mesh>
      <mesh
        position={[-0.45, 0, 0]}
        rotation={[0, 0, -Math.PI / 12]}
        geometry={getBox(0.2, 0.08, 0.32)}
      >
        <meshStandardMaterial color={teamColor} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 0.25, 0]} geometry={getCylinder(0.03, 0.03, 0.6, 8)}>
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      {/* Sail placeholder */}
      <mesh position={[0.15, 0.4, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.02, 0.4, 0.3]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
    </group>
  );
}

/**
 * The label for the galley model.
 */
export const MODEL_LABEL = 'galley';
