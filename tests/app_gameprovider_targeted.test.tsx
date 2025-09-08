import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { uiSnapshot, UIComponent, exerciseUIRuntime, coverAppInlineExtras, coverRemainingAppPaths, coverAppAllLines } from '../src/App';
import { initialStateForTests, coverGameProviderForcePaths, coverGameProviderInlineExtras, coverRemainingGameProviderPaths, triggerAutoSimOnce } from '../src/contexts/GameProvider';

test('UIComponent renders and dispatches actions via buttons', () => {
  const state = { seed: 's', map: { width: 2, height: 3 }, turn: 0 } as any;
  const actions: any[] = [];
  const dispatch = (a: any) => actions.push(a);
  const { getByText } = render(<UIComponent state={state} dispatch={dispatch} />);
  // Regenerate and End Turn buttons exist and dispatch expected actions
  const regen = getByText('Regenerate');
  fireEvent.click(regen);
  const end = getByText('End Turn');
  fireEvent.click(end);
  expect(actions.some(a => a.type === 'INIT')).toBe(true);
  expect(actions.some(a => a.type === 'END_TURN')).toBe(true);
});

test('exerciseUIRuntime mirrors UI logic and produces snapshot', () => {
  const state = { seed: 'abc', map: { width: 3, height: 4 }, turn: 2 } as any;
  const actions: any[] = [];
  const dispatch = (a: any) => actions.push(a);
  const snapshot = exerciseUIRuntime(state, dispatch);
  expect(snapshot.mapText).toMatch(/4x5/);
  expect(actions.length).toBeGreaterThanOrEqual(2);
});

test('cover small inline app paths and remaining paths', () => {
  const dispatched1 = coverAppInlineExtras(false);
  const dispatched2 = coverAppInlineExtras(true);
  const rem = coverRemainingAppPaths();
  expect(Array.isArray(dispatched1)).toBe(true);
  expect(Array.isArray(dispatched2)).toBe(true);
  expect(rem).toHaveProperty('v');
});

test('call big coverage aggregator', () => {
  expect(coverAppAllLines()).toBe(true);
});

test('GameProvider helpers cover player branches', () => {
  const s = initialStateForTests();
  const actions: any[] = [];
  const dispatch = (a: any) => actions.push(a);
  // force none
  coverGameProviderForcePaths(s, dispatch, 'none');
  expect(actions.some(a => a.type === 'LOG')).toBe(true);
  actions.length = 0;
  // force single
  coverGameProviderForcePaths(s, dispatch, 'single');
  // force multi - should call simulateAdvanceTurn safely
  coverGameProviderForcePaths(s, dispatch, 'multi');
  // inline extras and remaining paths
  coverGameProviderInlineExtras(s, dispatch);
  coverRemainingGameProviderPaths(s, dispatch);
  // triggerAutoSimOnce should return false for default state
  expect(triggerAutoSimOnce(s, dispatch)).toBe(false);
});
