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
  useFrame: (_callback: any) => {},
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => React.createElement('div', { 'data-testid': 'orbit' }),
  Html: (properties: any) =>
    React.createElement(
      'div',
      { 'data-testid': properties['data-testid'] ?? 'html' },
      properties.children
    ),
  Stats: () => React.createElement('div', { 'data-testid': 'stats' }),
  useGLTF: () => ({ scene: {} }),
  useTexture: (_url: string) => ({
    wrapS: 0,
    wrapT: 0,
    repeat: { set: (_x: number, _y: number) => {} },
    needsUpdate: false,
  }),
  Billboard: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'billboard' }, children),
  Text: ({ children }: any) => React.createElement('span', { 'data-testid': 'text' }, children),
}));

// Mock react-icons to avoid Vite resolving subpath imports in tests
vi.mock('react-icons/md', () => ({
  MdScience: (properties: any) =>
    React.createElement('i', { 'data-testid': 'md-science', ...properties }),
  MdTheaterComedy: (properties: any) =>
    React.createElement('i', { 'data-testid': 'md-theater', ...properties }),
}));

// Minimal PointerEvent polyfill for JSDOM environments that lack it.
// Some components/tests use pointer events; JSDOM (and some Node versions) may not
// expose the global PointerEvent constructor. Provide a lightweight shim that
// behaves sufficiently like PointerEvent for our tests.
if (typeof (globalThis as any).PointerEvent === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PolyPointerEvent: any = function (this: any, type: string, init?: any) {
    // Create a basic Event and copy pointer-specific fields from init
    const event = new Event(type, { bubbles: !!init?.bubbles, cancelable: !!init?.cancelable });
    // Attach commonly used pointer properties
    (event as any).pointerId = init?.pointerId ?? 1;
    (event as any).clientX = init?.clientX ?? 0;
    (event as any).clientY = init?.clientY ?? 0;
    (event as any).button = init?.button ?? 0;
    (event as any).buttons = init?.buttons ?? 1;
    // Synthesize isPrimary if requested
    (event as any).isPrimary = init?.isPrimary ?? true;
    return event;
  } as unknown as typeof PointerEvent;

  // Provide basic prototype so instanceof checks may behave more reasonably
  // Use `any` to avoid TypeScript structural complaints about the full PointerEvent
  ;(PolyPointerEvent as any).prototype = Event.prototype;

  // Assign to global
  (globalThis as any).PointerEvent = PolyPointerEvent;
}

// Expose a tiny helper to create pointer-like events for tests that prefer it.
if (typeof (globalThis as any).makePointerEvent === 'undefined') {
  (globalThis as any).makePointerEvent = (type: string, clientX = 0, clientY = 0, pointerId = 1) => {
    return new (globalThis as any).PointerEvent(type, { clientX, clientY, pointerId, bubbles: true, cancelable: true });
  };
}
