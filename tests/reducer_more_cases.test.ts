import { test, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from "..\\src\\contexts\\game-provider";
import { globalGameBus } from '../src/game/events';

test('INIT sets seed/map and emits turn:start', () => {
  const s = initialStateForTests();
  s.seed = 'abc';
  let started: any = null;
  const off = globalGameBus.on('turn:start', (p) => started = p);
  const next = applyAction(s, {
    type: 'INIT',
    payload: { seed: 'xyz', width: 5, height: 6 }
  } as any);
  expect(next.seed).toBe('xyz');
  expect(next.map.width).toBe(5);
  expect(started).toHaveProperty('turn');
  off();
});

test('SET_RESEARCH and ADVANCE_RESEARCH complete tech and emit event', () => {
  const s = initialStateForTests();
  const player = {
    id: 'p3',
    isHuman: true,
    sciencePoints: 0,
    culturePoints: 0,
    researchedTechIds: [] as string[],
    researching: null as any
  } as any;
  s.players = [player];

  // set research to pottery (cost 20)
  const afterSet = applyAction(s, {
    type: 'SET_RESEARCH',
    playerId: 'p3',
    payload: { techId: 'pottery' }
  } as any);
  expect(afterSet.players[0].researching).toBeTruthy();

  let unlocked: any = null;
  const off = globalGameBus.on('tech:unlocked', (p) => unlocked = p);

  // advance research by points equal to cost
  const afterAdv = applyAction(afterSet, {
    type: 'ADVANCE_RESEARCH',
    playerId: 'p3',
    payload: { points: 40 }
  } as any);
  expect(afterAdv.players[0].researchedTechIds).toContain('pottery');
  expect(afterAdv.players[0].researching).toBeNull();
  expect(unlocked).toEqual({ playerId: 'p3', techId: 'pottery' });

  off();
});

test('AUTO_SIM_TOGGLE flips autoSim flag', () => {
  const s = initialStateForTests();
  s.autoSim = false;
  const next = applyAction(s, { type: 'AUTO_SIM_TOGGLE', payload: { enabled: true } } as any);
  expect(next.autoSim).toBe(true);
});