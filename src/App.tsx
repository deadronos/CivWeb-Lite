import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { GameProvider } from './contexts/GameProvider';
import GameHUD from './components/GameHUD';
import { ConnectedScene as Scene } from './scene/Scene';
import TopBarContainer from './components/ui/TopBarContainer';
import LeftPanelContainer from './components/ui/LeftPanelContainer';
import MinimapContainer from './components/ui/MinimapContainer';
import NextTurnControlContainer from './components/ui/NextTurnControlContainer';
import { CameraProvider } from './hooks/useCamera';

export default function App() {
  const [cam, setCam] = React.useState<{ q: number; r: number } | null>(null);
  return (
    <GameProvider>
      <CameraProvider api={{ centerOn: (coord) => setCam(coord) }}>
        <Canvas camera={{ position: [8, 12, 12], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.6} />
          <Scene />
          <OrbitControls />
          <Stats />
        </Canvas>
        <GameHUD />
        <TopBarContainer />
        <LeftPanelContainer />
        <MinimapContainer />
        <NextTurnControlContainer />
        <div
          className="hud-cam-status"
          aria-label="camera position"
          style={{ position: 'fixed', right: 12, bottom: 192, color: 'var(--color-fg)' }}
        >
          Camera: {cam ? `${cam.q},${cam.r}` : '-'}
        </div>
      </CameraProvider>
    </GameProvider>
  );
}
