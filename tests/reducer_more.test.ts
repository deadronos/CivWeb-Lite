import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { GameState } from '../src/game/types';
import { globalGameBus } from '../src/game/events';

function makeState(): GameState {
  return {
    schemaVersion: 1,
    seed: 's',
    turn: 0,
    map: { width: 1, height: 1, tiles: [] },
    players: [],
    techCatalog: [],
    rngState: undefined,
    log: [],
    mode: 'standard',
    autoSim: false,
  };
}

describe('applyAction more branches', () => {
  it('SET_RESEARCH sets researching when prerequisites met', () => {
    const s = makeState();
    s.techCatalog = [{ id: 't1', cost: 1, tree: 'science', prerequisites: [] } as any];
    s.players = [{ id: 'p1', isHuman: true, sciencePoints: 1, culturePoints: 0, researching: null, researchedTechIds: [] } as any];
    const next = applyAction(s, { type: 'SET_RESEARCH', playerId: 'p1', payload: { techId: 't1' } });
    expect(next.players[0].researching).toBeTruthy();
    expect(next.players[0].researching!.techId).toBe('t1');
  });

  it('SET_RESEARCH does nothing when prerequisites missing', () => {
    const s = makeState();
    s.techCatalog = [{ id: 't2', cost: 1, tree: 'science', prerequisites: ['x'] } as any];
    s.players = [{ id: 'p2', isHuman: true, sciencePoints: 1, culturePoints: 0, researching: null, researchedTechIds: [] } as any];
    const next = applyAction(s, { type: 'SET_RESEARCH', playerId: 'p2', payload: { techId: 't2' } });
    expect(next.players[0].researching).toBeNull();
  });

  it('ADVANCE_RESEARCH completes tech and emits event', () => {
    const s = makeState();
    s.techCatalog = [{ id: 't3', cost: 2, tree: 'science', prerequisites: [] } as any];
    s.players = [{ id: 'p3', isHuman: true, sciencePoints: 1, culturePoints: 0, researching: { techId: 't3', progress: 0 }, researchedTechIds: [] } as any];
    const events: any[] = [];
    globalGameBus.on('tech:unlocked', (p) => events.push(p));
    const next = applyAction(s, { type: 'ADVANCE_RESEARCH', playerId: 'p3', payload: { points: 2 } });
    expect(next.players[0].researching).toBeNull();
    expect(next.players[0].researchedTechIds).toContain('t3');
    expect(events.length).toBeGreaterThan(0);
    globalGameBus.off('tech:unlocked', () => {});
  });

  it('AUTO_SIM_TOGGLE toggles autoSim', () => {
    const s = makeState();
    const t1 = applyAction(s, { type: 'AUTO_SIM_TOGGLE' });
    expect(t1.autoSim).toBe(true);
    const t2 = applyAction(t1, { type: 'AUTO_SIM_TOGGLE', payload: { enabled: false } });
    expect(t2.autoSim).toBe(false);
  });
});
