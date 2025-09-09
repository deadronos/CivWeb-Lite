import React from 'react';
import { Canvas } from '@react-three/fiber';
import { GameProvider } from './contexts/game-provider';
import GameHUD from './components/game-hud';
import { ConnectedScene as Scene } from './scene/scene';
import TopBarContainer from './components/ui/top-bar-container';
import LeftPanelContainer from './components/ui/left-panel-container';
import MinimapContainer from './components/ui/minimap-container';
import NextTurnControlContainer from './components/ui/next-turn-control-container';
import { CameraProvider } from './hooks/use-camera';
import { SelectionProvider } from './contexts/selection-context';
import { HoverProvider } from './contexts/hover-context';
import MainMenu from './components/ui/main-menu';
import { useGame } from './hooks/use-game';
import CameraControls from './scene/drei/camera-controls';
import DevStats from './scene/drei/dev-stats';
import { isDevOrTest as isDevelopmentOrTest } from './utils/env';

export default function App() {
  const [cam, setCam] = React.useState<{ q: number; r: number } | null>(null);
  const [started, setStarted] = React.useState(false);
  return (
    <GameProvider>
      <SelectionProvider>
        <HoverProvider>
          <CameraProvider api={{ centerOn: (coord) => setCam(coord) }}>
            {!started && <MainMenu onStart={() => setStarted(true)} />}
            <LoadListener onLoaded={() => setStarted(true)} />
            <Canvas camera={{ position: [8, 12, 12], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 10, 5]} intensity={0.6} />
              <Scene />
              <CameraControls />
              <DevStats enabled={isDevelopmentOrTest()} />
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
        </HoverProvider>
      </SelectionProvider>
    </GameProvider>
  );
}

function LoadListener({ onLoaded }: { onLoaded: () => void }) {
  const game = useGame();
  React.useEffect(() => {
    const handler = (e: any) => {
      game.dispatch({ type: 'LOAD_STATE', payload: e.detail });
      onLoaded();
    };
    globalThis.addEventListener('civweblite:loadState', handler);
    return () => globalThis.removeEventListener('civweblite:loadState', handler);
  }, [game.dispatch, onLoaded]);
  return null;
}
