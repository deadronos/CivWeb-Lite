import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock heavy deps before importing App so JSX in App uses light stubs
vi.mock('@react-three/fiber', () => ({ Canvas: (props: any) => <div data-testid="mock-canvas">{props.children}</div> }));
vi.mock('@react-three/drei', () => ({ OrbitControls: () => <div data-testid="mock-orbit" />, Stats: () => <div data-testid="mock-stats" /> }));
vi.mock('../src/scene/Scene', () => ({ __esModule: true, default: () => <div data-testid="mock-scene" /> }));

import App from '../src/App';

describe('Render App with mocks', () => {
  it('renders App without three.js and shows UI elements', () => {
    // Render App; our mocks replace Canvas and scene
    render(<App />);
    // UI should render and include End Turn button
    expect(screen.getByText('End Turn')).toBeDefined();
    expect(screen.getByTestId('mock-canvas')).toBeDefined();
    expect(screen.getByTestId('mock-scene')).toBeDefined();
  });
});
