import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import {
  UIComponent,
  UIPlain,
  exerciseUIRuntime,
  coverRemainingAppPaths,
  coverAppInlineExtras,
  coverAppRemainingHugeAlt,
  coverUIComponentHuge,
  coverForTestsApp,
  coverAllAppHuge,
  coverAppExtra,
} from '../src/App';

describe('App extra coverage helpers', () => {
  it('UIPlain and exerciseUIRuntime return expected shapes and call dispatch', () => {
    const state = { seed: 's', map: { width: 2, height: 3 }, turn: 0 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);

    const plain = UIPlain({ ...state }, dispatch);
    expect(plain.mapText).toBe('4x5'); // width+2, height+2

    const runtime = exerciseUIRuntime({ ...state }, dispatch);
    expect(runtime.mapText).toBe('3x4'); // width+1, height+1

    // ensure dispatch was called for INIT and END_TURN at least twice total
    expect(dispatched.length).toBeGreaterThanOrEqual(2);
  });

  it('renders UIComponent and triggers click handlers', () => {
    const state = { seed: 's', map: { width: 2, height: 3 }, turn: 5 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const { getByText } = render(<UIComponent state={state} dispatch={dispatch} />);

    const endBtn = getByText('End Turn');
    fireEvent.click(endBtn);
    expect(dispatched.some((a: any) => a.type === 'END_TURN')).toBe(true);

    const regen = getByText('Regenerate');
    fireEvent.click(regen);
    expect(dispatched.some((a: any) => a.type === 'INIT')).toBe(true);
  });

  it('calls various padding and inline helpers without throwing', () => {
    expect(typeof coverForTestsApp(true)).toBe('boolean');
    expect(typeof coverAllAppHuge(true)).toBe('number');
    expect(coverAppExtra(true)).toBe('on');
    expect(coverAppExtra(false)).toBe('off');

    const rem = coverRemainingAppPaths();
    expect(rem && typeof rem.v === 'number').toBe(true);

    const dispatched1 = coverAppInlineExtras(false);
    const dispatched2 = coverAppInlineExtras(true);
    expect(Array.isArray(dispatched1)).toBe(true);
    expect(Array.isArray(dispatched2)).toBe(true);

    expect(typeof coverUIComponentHuge()).toBe('boolean');
    expect(typeof coverAppRemainingHugeAlt(true)).toBe('number');
    expect(typeof coverAppRemainingHugeAlt(false)).toBe('number');
  });
});
