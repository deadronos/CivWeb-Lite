import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Scene from '../src/scene/Scene';
import { SCENE_RUNTIME_MARKER } from '../src/scene/Scene';

describe('Scene component', () => {
  it('renders a group element', () => {
    const { container } = render(<Scene />);
    expect(container.querySelector('group')).toBeTruthy();
  });

  it('exports runtime marker', () => {
    expect(SCENE_RUNTIME_MARKER).toBeTruthy();
  });
});
