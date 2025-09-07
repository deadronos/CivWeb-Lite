import React from 'react'
import { useGame } from '../game/GameProvider'

function TileMesh({ x, y, terrain }: { x: number; y: number; terrain: string }) {
  const color = terrain === 'water' ? 'royalblue' : 'green'
  return (
    <mesh position={[x - 8, 0, y - 6]}>
      <boxGeometry args={[0.95, 0.2, 0.95]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function UnitMesh({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x - 8, 0.4, y - 6]}>
      <cylinderGeometry args={[0.3, 0.3, 0.8, 12]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  )
}

export default function Scene() {
  const { grid, units } = useGame()
  return (
    <group>
      {grid.map((t) => (
        <TileMesh key={`t-${t.x}-${t.y}`} x={t.x} y={t.y} terrain={t.terrain} />
      ))}
      {units.map((u) => (
        <UnitMesh key={u.id} x={u.x} y={u.y} />
      ))}
    </group>
  )
}
