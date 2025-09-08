import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// Mock heavy three/fiber and drei modules to avoid WebGL in tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>,
}));
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit" />,
  Stats: () => <div data-testid="mock-stats" />,
}));

test('renders App with mocked Canvas and shows UI', async () => {
  const App = (await import('../src/App')).default;
  render(<App />);
  // UI should show initial turn 0
  expect(screen.getByText(/Turn:/)).toBeTruthy();
  // mocked canvas should be present
  expect(screen.getByTestId('mock-canvas')).toBeTruthy();
});
