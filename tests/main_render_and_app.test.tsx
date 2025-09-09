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
  }));
  vi.doMock('@react-three/drei', () => ({
    OrbitControls: () => <div data-testid="orbit" />,
    Stats: () => <div data-testid="stats" />,
  }));
  vi.doMock('../src/scene/Scene', () => ({
    default: () => <div data-testid="scene" />,
    ConnectedScene: () => <div data-testid="scene" />,
  }));
  // import App after mocks
  const App = (await import('../src/App')).default;
  render(<App />);
  expect(screen.getByTestId('canvas')).toBeDefined();
  expect(screen.getByTestId('scene')).toBeDefined();
  expect(screen.getByTestId('orbit')).toBeDefined();
  expect(screen.getByTestId('stats')).toBeDefined();
  vi.resetModules();
});
