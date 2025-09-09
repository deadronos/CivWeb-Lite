import { evaluateAI } from '../src/game/ai/ai';
import { generateWorld } from '../src/game/world/generate';
// (no direct RNG imports required here; generateWorld returns RNG state)
import { LEADER_PERSONALITIES } from '../src/game/ai/leaders';
import { TechNode, PlayerState, GameState } from '../src/game/types';

function nowMs(): number {
  if (typeof performance !== 'undefined' && performance.now) return performance.now();
  return Date.now();
}

function stats(values: number[]) {
  if (values.length === 0) return { mean: 0, median: 0, p95: 0, count: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  return { mean, median, p95, count: sorted.length };
}

function makePlayer(id: string, leaderIdx: number): PlayerState {
  return {
    id,
    isHuman: false,
    leader: LEADER_PERSONALITIES[leaderIdx % LEADER_PERSONALITIES.length],
    sciencePoints: 0,
    culturePoints: 0,
    researchedTechIds: [],
    researching: null,
  };
}

function makeInitialState(seed: string, width: number, height: number, numAI: number): GameState {
  const world = generateWorld(seed, width, height);
  const players = [] as PlayerState[];
  for (let i = 0; i < numAI; i++) players.push(makePlayer(`AI-${i + 1}`, i));
  const techCatalog: TechNode[] = [];
  return {
    schemaVersion: 1,
    seed,
    turn: 0,
    map: { width, height, tiles: world.tiles },
    players,
    techCatalog,
    rngState: world.state,
    log: [],
    mode: 'ai-sim',
    autoSim: false,
  };
}

async function runOnce(seed: string, width: number, height: number, numAI: number) {
  const state = makeInitialState(seed, width, height, numAI);
  const perCall: number[] = [];
  for (const p of state.players) {
    const t0 = nowMs();
    // evaluateAI is pure and returns actions quickly
    evaluateAI(p, state);
    const t1 = nowMs();
    perCall.push(t1 - t0);
  }
  return perCall;
}

async function runBenchmark() {
  const seeds = ['bench-seed-1', 'bench-seed-2', 'bench-seed-3'];
  const mapSizes = [30, 50];
  const numAI = 5;
  const iterations = 5;
  const results: any = {};
  for (const size of mapSizes) {
    const allTimes: number[] = [];
    for (let it = 0; it < iterations; it++) {
      const seed = seeds[it % seeds.length];
      const times = await runOnce(seed, size, size, numAI);
      allTimes.push(...times);
    }
    results[`map_${size}`] = stats(allTimes);
  }
  console.log(JSON.stringify(results, null, 2));
}

runBenchmark().catch((err) => {
  console.error('Benchmark failed', err);
  throw err;
});
