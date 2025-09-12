import { describe, it, expect } from 'vitest';
import { verifyReplay } from './utils/replay-helper';

const K = Number(process.env.REPLAY_SEEDS ?? 10);

describe('deterministic replay verification', () => {
  for (let index = 0; index < K; index++) {
    const seed = `seed-${index}`;
    it(`replays seed ${seed}`, async () => {
      const ok = await verifyReplay(seed);
      expect(ok).toBe(true);
    });
  }
});
