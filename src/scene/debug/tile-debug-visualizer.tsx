/**
 * Debug visualization component to help diagnose tile rendering issues
 */

import React from 'react';
import { useGame } from '../../hooks/use-game';
import { axialToWorld, DEFAULT_HEX_SIZE } from '../utils/coords';

export function TileDebugVisualizer() {
  const { state } = useGame();
  const tiles = state.map.tiles;

  // Create simple colored boxes at each tile position to verify coordinate mapping
  return (
    <group>
      {tiles.slice(0, 20).map((tile, index) => {
        const [x, z] = axialToWorld(tile.coord.q, tile.coord.r, DEFAULT_HEX_SIZE);

        // Color based on biome for easy identification
        const colors = {
          Grassland: '#4CAF50',
          Ocean: '#2196F3',
          Forest: '#388E3C',
          Desert: '#FF9800',
          Mountain: '#795548',
          Tundra: '#607D8B',
          Ice: '#E3F2FD',
        };

        const color = colors[String(tile.biome)] || '#FF0000'; // Red for unknown biomes

        return (
          <mesh key={tile.id} position={[x, 0.1, z]}>
            <boxGeometry args={[0.4, 0.2, 0.4]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}

      {/* Reference grid for coordinate system verification */}
      <group>
        {Array.from({ length: 5 }, (_, index) => (
          <mesh key={`grid-x-${index}`} position={[index * 2, 0.05, 0]}>
            <boxGeometry args={[0.1, 0.1, 2]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.3} transparent />
          </mesh>
        ))}
        {Array.from({ length: 5 }, (_, index) => (
          <mesh key={`grid-z-${index}`} position={[0, 0.05, index * 2]}>
            <boxGeometry args={[2, 0.1, 0.1]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.3} transparent />
          </mesh>
        ))}
      </group>

      {/* Origin marker */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="#FF00FF" />
      </mesh>
    </group>
  );
}
