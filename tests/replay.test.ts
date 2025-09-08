import { describe, it, expect } from 'vitest';
import { initialStateForTests } from '../src/contexts/GameProvider';
import { record, runReplay, hashState } from '../src/game/utils/replay';
import { applyAction } from '../src/game/reducer';

describe('Deterministic replay harness', () => {
  it('produces identical final hash for identical action sequence', async () => {
    const s0 = initialStateForTests();
    // initialize with fixed seed and size
    const actions = [
      { type: 'INIT', payload: { seed: 'rep-seed', width: 10, height: 10 } } as const,
      { type: 'END_TURN' } as const,
      { type: 'END_TURN' } as const,
    ];
    const rep = record(...(actions as any));
  const r1 = await runReplay(s0, rep);
  const r2 = await runReplay(s0, rep);
  expect(r1.hash).toEqual(r2.hash);
    // direct application should match too
    let sDirect = s0;
    for (const a of actions) sDirect = applyAction(sDirect, a as any);
    expect(r1.hash).toEqual(await hashState(sDirect));
  });
});

