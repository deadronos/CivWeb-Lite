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
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => React.createElement('div', { 'data-testid': 'orbit' }),
  Html: (props: any) =>
    React.createElement('div', { 'data-testid': props['data-testid'] ?? 'html' }, props.children),
  Stats: () => React.createElement('div', { 'data-testid': 'stats' }),
  useGLTF: () => ({ scene: {} }),
  Billboard: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'billboard' }, children),
  Text: ({ children }: any) => React.createElement('span', { 'data-testid': 'text' }, children),
}));

// Mock react-icons to avoid Vite resolving subpath imports in tests
vi.mock('react-icons/md', () => ({
  MdScience: (props: any) => React.createElement('i', { 'data-testid': 'md-science', ...props }),
  MdTheaterComedy: (props: any) =>
    React.createElement('i', { 'data-testid': 'md-theater', ...props }),
}));

export {};
