import React from 'react';
import { render, fireEvent } from '@testing-library/react';

test('render App with mocked three and scene to exercise Canvas and UI branches', async () => {
  // reset modules and mock heavy 3D deps before importing App
  vi.resetModules();
  const CanvasMock = ({ children }: any) => <div data-testid="canvas">{children}</div>;
  vi.doMock('@react-three/fiber', () => ({ Canvas: CanvasMock }));
  vi.doMock('@react-three/drei', () => ({ OrbitControls: () => <div />, Stats: () => <div /> }));
  vi.doMock('../src/scene/Scene', () => ({ __esModule: true, default: () => <div>Scene</div> }));

  const AppModule = await import('../src/App');
  const App = AppModule.default;
  const { container, getByText } = render(<App /> as any);

  // find inputs and change seed value then click Regenerate and End Turn to exercise handlers
  const inputs = container.querySelectorAll('input');
  if (inputs && inputs.length > 0) {
    const seedInput = inputs[0] as HTMLInputElement;
    seedInput.value = 'test-seed';
    fireEvent.change(seedInput);
  }

  const regen = getByText('Regenerate');
  fireEvent.click(regen);
  const end = getByText('End Turn');
  fireEvent.click(end);

  // ensure UI rendered and Canvas mock was used
  expect(getByText('Regenerate')).toBeTruthy();
  expect(container.querySelector('[data-testid="canvas"]')).toBeTruthy();
});
