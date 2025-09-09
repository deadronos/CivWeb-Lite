import { test, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from "..\\src\\contexts\\game-provider";
import { globalGameBus } from '../src/game/events';

test('END_TURN completes research and emits tech:unlocked', () => {
  const s = initialStateForTests();
  // prepare a player researching 'pottery' which costs 20
  const player = {
    id: 'p1',
    isHuman: true,
    sciencePoints: 1,
    culturePoints: 0,
    researchedTechIds: [] as string[],
    researching: { techId: 'pottery', progress: 19 }
  } as any;
  s.players = [player];

  let unlocked: any = null;
  const off = globalGameBus.on('tech:unlocked', (p) => {
    unlocked = p;
  });

  const next = applyAction(s, { type: 'END_TURN' } as any);

  // player should have pottery researched and researching cleared
  expect(next.players[0].researchedTechIds).toContain('pottery');
  expect(next.players[0].researching).toBeNull();
  // event should have been emitted
  expect(unlocked).toEqual({ playerId: 'p1', techId: 'pottery' });

  off();
});