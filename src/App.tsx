import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { GameProvider } from './contexts/GameProvider';
import { useGame } from './hooks/useGame';
import Scene from './scene/Scene';

function UI() {
  const { state, dispatch } = useGame();
  return (
    <div className="ui">
      <div>Turn: {state.turn}</div>
      <button onClick={() => dispatch({ type: 'END_TURN' })}>End Turn</button>
    </div>
  );
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
  );
}
