import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock heavy three libs before importing App
vi.mock('@react-three/fiber', () => ({ Canvas: (props: any) => <div data-testid="canvas">{props.children}</div> }));
vi.mock('@react-three/drei', () => ({ OrbitControls: () => <div />, Stats: () => <div /> }));

describe('App', () => {
  it('imports and renders UI elements', async () => {
    const { default: App } = await import('../src/App');
    render(<App />);
    // UI renders a 'Seed' input label
    expect(screen.getByText(/Seed:/)).toBeTruthy();
  });
});
