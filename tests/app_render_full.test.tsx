import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock heavy 3D deps and local Scene and GameProvider to allow App to render in tests
vi.doMock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>
}));
vi.doMock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit" />,
  Stats: () => <div data-testid="stats" />,
}));
vi.doMock('../src/scene/Scene', () => ({ default: () => <div data-testid="scene" /> }));

// Provide a lightweight GameProvider that just renders children for this test
vi.doMock('../src/contexts/GameProvider', () => ({
  GameProvider: ({ children }: any) => <div data-testid="gp">{children}</div>
}));

describe('App full render with mocked 3D and provider', () => {
  it('renders App default export without throwing and includes Canvas and UI', async () => {
    // import after mocks applied
    const App = (await import('../src/App')).default;
    const { findByTestId, getByText } = render(<App />);
    expect(await findByTestId('canvas')).toBeTruthy();
    expect(await findByTestId('scene')).toBeTruthy();
    // UI should render Turn label
    expect(getByText(/Turn:/)).toBeTruthy();
    // cleanup mocks for other tests
    vi.unmock('@react-three/fiber');
    vi.unmock('@react-three/drei');
    vi.unmock('../src/scene/Scene');
    vi.unmock('../src/contexts/GameProvider');
  });
});
