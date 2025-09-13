import { initialStateForTests } from '../../src/test-utils/game-provider';
import { record, runReplay, hashState } from '../../src/game/utils/replay';
import { applyAction } from '../../src/game/reducer';
import { seedFrom, nextInt } from '../../src/game/rng';
import type { GameAction } from '../../src/game/actions';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Runs a deterministic simulation for a given seed and verifies replay consistency.
 * Writes a reproduction log to test-results on mismatch.
 * @returns true if the replay hash matches the direct run.
 */
export async function verifyReplay(seed: string): Promise<boolean> {
  const initial = initialStateForTests();
  let state = initial;
  const actions: GameAction[] = [];
  let rng = seedFrom(seed);

  // Randomize map size and turn count based on RNG
  let out = nextInt(rng, 4);
  rng = out.state;
  const width = 8 + out.value;
  out = nextInt(rng, 4);
  rng = out.state;
  const height = 8 + out.value;
  out = nextInt(rng, 3);
  rng = out.state;
  const turns = 1 + out.value;

  const newGame = {
    type: 'NEW_GAME',
    payload: { seed, width, height, totalPlayers: 1 },
  } as GameAction;
  actions.push(newGame);
  state = applyAction(state, newGame as any);

  for (let index = 0; index < turns; index++) {
    const endTurn = { type: 'END_TURN' } as GameAction;
    actions.push(endTurn);
    state = applyAction(state, endTurn as any);
  }

  const replay = record(...actions);
  const result = await runReplay(initial, replay);
  const expectedHash = await hashState(state);
  if (result.hash !== expectedHash) {
    mkdirSync('test-results', { recursive: true });
    writeFileSync(
      join('test-results', `replay-failure-${seed}.json`),
      JSON.stringify({ seed, actions }, null, 2)
    );
    return false;
  }
  return true;
}
