import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { GameProvider } from './contexts/GameProvider';
import { useGame } from './hooks/useGame';
import Scene from './scene/Scene';

function UI() {
  const { state, dispatch } = useGame();
  const [seed, setSeed] = React.useState(state.seed);
  const [width, setWidth] = React.useState(state.map.width);
  const [height, setHeight] = React.useState(state.map.height);
  return (
    <div className="ui">
      <div>
        Seed: <input value={seed} onChange={(e) => setSeed(e.target.value)} />
        Width:{' '}
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
        Height:{' '}
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
        />
        <button
          onClick={() =>
            dispatch({ type: 'INIT', payload: { seed, width, height } })
          }
        >
          Regenerate
        </button>
      </div>
      <div>Turn: {state.turn}</div>
      <div>
        Map: {state.map.width}x{state.map.height}
      </div>
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
