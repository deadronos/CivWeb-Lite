import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import GameProvider, { useGame } from './game/GameProvider'
import Scene from './scene/Scene'

function UI() {
  const { endTurn, turn } = useGame()
  return (
    <div className="ui">
      <div>Turn: {turn}</div>
      <button onClick={endTurn}>End Turn</button>
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Canvas camera={{ position: [8, 12, 12], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} />
        <Scene />
        <OrbitControls />
        <Stats />
      </Canvas>
      <UI />
    </GameProvider>
  )
}
