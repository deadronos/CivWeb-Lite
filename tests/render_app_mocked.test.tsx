import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock heavy 3D modules to safe stubs before importing App
vi.mock('@react-three/fiber', () => ({
  Canvas: (props: any) => <div data-testid="mock-canvas">{props.children}</div>,
}));
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit" />,
  Stats: () => <div data-testid="mock-stats" />,
}));
vi.mock('../src/scene/Scene', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-scene" />,
}));

import App from '../src/App';

describe('Render App with mocked 3D modules', () => {
  it('renders App without WebGL by mocking heavy modules', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('mock-canvas')).toBeDefined();
    expect(getByTestId('mock-scene')).toBeDefined();
    expect(getByTestId('mock-orbit')).toBeDefined();
    expect(getByTestId('mock-stats')).toBeDefined();
  });
});
