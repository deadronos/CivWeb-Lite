// Vitest setup file
// Place global mocks, test-time polyfills or global utilities here.

// Provides jest-dom matchers like toBeInTheDocument()
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Base mocks for R3F/Drei to keep jsdom stable in unit tests.
// Individual tests can override with vi.doMock as needed.
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => React.createElement('div', { 'data-testid': 'canvas' }, children),
  // Minimal hooks used by components in tests. useThree should provide a camera
  // with a position.set and lookAt, and a gl.domElement for event listeners.
  useThree: () => ({
    camera: {
      position: { set: (_x: number, _y: number, _z: number) => {} },
      lookAt: (_target: any) => {},
    },
    gl: { domElement: document.createElement('canvas') },
    scene: {},
    size: { width: 800, height: 600 },
  }),
  // useFrame registers a callback for animation frames. For tests a no-op is fine.
  useFrame: (_cb: any) => undefined,
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => React.createElement('div', { 'data-testid': 'orbit' }),
  Html: (properties: any) =>
    React.createElement('div', { 'data-testid': properties['data-testid'] ?? 'html' }, properties.children),
  Stats: () => React.createElement('div', { 'data-testid': 'stats' }),
  useGLTF: () => ({ scene: {} }),
  Billboard: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'billboard' }, children),
  Text: ({ children }: any) => React.createElement('span', { 'data-testid': 'text' }, children),
}));

// Mock react-icons to avoid Vite resolving subpath imports in tests
vi.mock('react-icons/md', () => ({
  MdScience: (properties: any) => React.createElement('i', { 'data-testid': 'md-science', ...properties }),
  MdTheaterComedy: (properties: any) =>
    React.createElement('i', { 'data-testid': 'md-theater', ...properties }),
}));


