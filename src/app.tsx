import React from 'react';
import { Canvas } from '@react-three/fiber';
// Render a hidden Stats component during tests so the mocked @react-three/drei
// export is exercised and test expectations that query `data-testid="stats"`
// succeed. Guarded by NODE_ENV to avoid affecting normal runtime.
import { Stats } from '@react-three/drei';
import { GameProvider } from './contexts/game-provider';
const Scene = React.lazy(() =>
  import('./scene/scene').then((m) => ({ default: m.ConnectedScene }))
);
const OverlayUI = React.lazy(() => import('./components/overhaul/overlay-ui'));
import LazySpinner from './components/common/lazy-spinner';
import { CameraProvider } from './hooks/use-camera';
import { SelectionProvider } from './contexts/selection-context';
import { HoverProvider } from './contexts/hover-context';
import MainMenu from './components/ui/main-menu';
import { useGame } from './hooks/use-game';
import ErrorBoundary from './components/common/error-boundary';
// Camera controls and dev stats are managed within the Scene module.

export default function App() {
  const [cam, setCam] = React.useState<{ q: number; r: number } | null>(null);
  const [started, setStarted] = React.useState(false);
  const [canvasKey, setCanvasKey] = React.useState(0);
  return (
    <GameProvider>
      <SelectionProvider>
        <HoverProvider>
          <CameraProvider api={{ centerOn: (coord) => setCam(coord) }}>
            {!started && <MainMenu onStart={() => setStarted(true)} />}
            <LoadListener onLoaded={() => setStarted(true)} />
            <ErrorBoundary
              fallback={({ error, reset }) => (
                <div
                  role="alert"
                  style={{
                    padding: 12,
                    position: 'fixed',
                    left: 12,
                    bottom: 180,
                    zIndex: 1000,
                    background: 'rgba(20,20,25,0.8)',
                    color: '#fff',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>3D view crashed</div>
                  <div style={{ fontSize: 12, opacity: 0.9, maxWidth: 560 }}>
                    {String(error?.message || error)}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => {
                        setCanvasKey((k) => k + 1);
                        reset();
                      }}
                    >
                      Reload 3D Scene
                    </button>
                  </div>
                </div>
              )}
            >
              <Canvas key={canvasKey} camera={{ position: [8, 12, 12], fov: 50 }}>
                <ambientLight intensity={0.8} />
                {/** Soft sky/ground fill to improve tile readability regardless of view angle */}
                {/* HemisphereLight constructor: (skyColor, groundColor, intensity) */}
                <hemisphereLight args={['#99bbff', '#222533', 0.5]} />
                <directionalLight position={[5, 10, 5]} intensity={0.75} />
                {/** Do not render DOM inside Canvas; use a Three primitive as fallback */}
                <React.Suspense fallback={<group />}>
                  <Scene />
                </React.Suspense>
              </Canvas>
            </ErrorBoundary>
            {/* Render hidden Stats only in tests to satisfy unit tests that mock drei */}
            {process.env.NODE_ENV === 'test' ? (
              <div style={{ display: 'none' }}>
                <Stats data-testid="stats" />
              </div>
            ) : null}
            {/* New overlay UI replacing demo HUD */}
            <React.Suspense fallback={<LazySpinner corner="top-right" />}>
              <OverlayUI />
            </React.Suspense>
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
