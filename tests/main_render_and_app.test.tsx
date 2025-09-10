import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

test('main.tsx catches render errors when createRoot.render throws', async () => {
  // reset modules so we can re-import with mocks
  vi.resetModules();
  // create a real root element so main attempts to mount
  const root = document.createElement('div');
  root.id = 'root';
  document.body.append(root);

  // mock react-dom/client to throw during render
  vi.doMock('react-dom/client', () => ({
    createRoot: () => ({
      render: () => {
        throw new Error('render-fail');
      },
    }),
  }));

  const dbg = vi.spyOn(console, 'debug').mockImplementation(() => {});
  // dynamic import will execute guarded bootstrap
  await import('../src/main');
  expect(dbg).toHaveBeenCalled();

  dbg.mockRestore();
  // cleanup
  root.remove();
  vi.resetModules();
});

test('render App default with mocked three deps', async () => {
  vi.resetModules();
  // mock Canvas and children to be simple DOM
  vi.doMock('@react-three/fiber', () => ({
    Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
    useThree: () => ({
      camera: { position: { set: (_x: number, _y: number, _z: number) => {} }, lookAt: (_t: any) => {} },
      gl: { domElement: document.createElement('canvas') },
      scene: {},
      size: { width: 800, height: 600 },
    }),
    useFrame: (_callback: any) => {},
  }));
  vi.doMock('@react-three/drei', () => ({
    OrbitControls: () => <div data-testid="orbit" />,
    Stats: () => <div data-testid="stats" />,
  }));
  // App imports ./scene/scene (lowercase). Mock both paths to be safe.
  vi.doMock('../src/scene/scene', () => ({
    default: () => (
      <div data-testid="scene">
        <div data-testid="orbit" />
      </div>
    ),
    ConnectedScene: () => (
      <div data-testid="scene">
        <div data-testid="orbit" />
      </div>
    ),
  }));
  vi.doMock('../src/scene/Scene', () => ({
    default: () => (
      <div data-testid="scene">
        <div data-testid="orbit" />
      </div>
    ),
    ConnectedScene: () => (
      <div data-testid="scene">
        <div data-testid="orbit" />
      </div>
    ),
  }));
  // import App after mocks
  const { default: App } = await import('../src/App');
  render(<App />);
  expect(screen.getByTestId('canvas')).toBeDefined();
  await screen.findByTestId('scene');
  expect(screen.getByTestId('orbit')).toBeDefined();
  expect(screen.getByTestId('stats')).toBeDefined();
  vi.resetModules();
});
