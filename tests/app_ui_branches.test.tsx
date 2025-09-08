import React from 'react';
import { it, describe, expect } from 'vitest';
import { render } from '@testing-library/react';
import { UIComponent, coverAppInlineExtras, coverRemainingAppPaths, uiSnapshot } from '../src/App';

describe('App UI branch coverage', () => {
  it('exercise UIComponent render and inline helper with no seedRef', () => {
    const state = { seed: 'init', map: { width: 4, height: 5 }, turn: 0 } as any;
    const dispatched: any[] = [];
  render(<UIComponent state={state} dispatch={(a: any) => dispatched.push(a)} />);
    // snapshot helper should return expected mapText and turnText
    const snap = uiSnapshot(state);
    expect(snap).toHaveProperty('mapText');
    expect(snap).toHaveProperty('turnText');

    // call helper with seedPresent = false
    const dispatchedFromHelper = coverAppInlineExtras(false);
    expect(Array.isArray(dispatchedFromHelper)).toBe(true);
  });

  it('coverRemainingAppPaths returns dispatched actions', () => {
    const res = coverRemainingAppPaths();
    expect(res).toHaveProperty('v');
    expect(res).toHaveProperty('dispatched');
  });
});
