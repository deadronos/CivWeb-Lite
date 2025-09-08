import { describe, it } from 'vitest';
import { evaluateAI } from '../../src/game/ai/ai';
import { GameState, PlayerState } from '../../src/game/types';
import { techCatalog } from '../../src/game/tech/techCatalog';
import { LEADER_PERSONALITIES } from '../../src/game/ai/leaders';

function baseState(player: PlayerState): GameState {
  return {
    schemaVersion: 1,
    seed: 'bench-seed',
    turn: 0,
    map: { width: 10, height: 10, tiles: [] },
    players: [player],
    techCatalog,
    rngState: undefined,
    log: [],
    mode: 'standard',
    autoSim: false,
  };
}

describe('AI benchmark', () => {
  it('measures average evaluateAI time across leaders', () => {
    const leaders = LEADER_PERSONALITIES.slice(0, 4);
    const players: PlayerState[] = leaders.map((leader, i) => ({
      id: `p${i}`,
      isHuman: false,
      leader,
      sciencePoints: 10,
      culturePoints: 10,
      researchedTechIds: [],
      researching: null,
    }));

    const iterations = 300; // controlled iteration count for CI speed
    let totalMs = 0;
    for (let i = 0; i < iterations; i++) {
      for (const p of players) {
        const state = baseState(p);
        const start = performance.now();
        evaluateAI(p, state);
        const dur = performance.now() - start;
        totalMs += dur;
      }
    }
    const avgMsPerCall = totalMs / (iterations * players.length);
    // Log summary so it's visible in test output
    // eslint-disable-next-line no-console
    console.info(`AI benchmark: avg evaluateAI ${avgMsPerCall.toFixed(4)} ms over ${iterations * players.length} calls`);
    // Keep test non-blocking — assert that it's a number and not NaN
    if (!Number.isFinite(avgMsPerCall)) throw new Error('Invalid benchmark result');
  });
});
