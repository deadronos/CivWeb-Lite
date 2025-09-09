import { describe, it, expect } from 'vitest';
import { generateWorld } from '../src/game/world/generate';

describe('world generation', () => {
  it('produces at least five biomes for 30x30 map', () => {
    const { tiles } = generateWorld('test-seed', 30, 30);
    const biomes = new Set(tiles.map((t) => t.biome));
    expect(biomes.size).toBeGreaterThanOrEqual(5);
  });
});
