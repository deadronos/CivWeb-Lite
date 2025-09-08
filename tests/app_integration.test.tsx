import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock heavy three libs before importing App
vi.mock('@react-three/fiber', () => ({ Canvas: (props: any) => <div data-testid="canvas">{props.children}</div> }));
vi.mock('@react-three/drei', () => ({ OrbitControls: () => <div />, Stats: () => <div /> }));

describe('App integration', () => {
  it('allows user to change inputs and click buttons', async () => {
    const { default: App } = await import('../src/App');
    render(<App />);
    // should render Seed label and End Turn
    expect(screen.getByText(/Seed:/)).toBeTruthy();
    // find inputs
    const seedInput = screen.getByDisplayValue(/default/);
    fireEvent.change(seedInput, { target: { value: 'abc' } });
    const regen = screen.getByText('Regenerate');
    fireEvent.click(regen);
    const end = screen.getByText('End Turn');
    fireEvent.click(end);
    expect(screen.getByText(/Turn:/)).toBeTruthy();
  });
});
