import { evaluateAI } from '../src/game/ai/ai';
import { generateWorld } from '../src/game/world/generate';
import { LEADER_PERSONALITIES } from '../src/game/ai/leaders';
import type { GameState, PlayerState, TechNode } from '../src/game/types';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

interface Stats { mean: number; median: number; p95: number; count: number }

function computeStats(values: number[]): Stats {
  if (values.length === 0) return { mean: 0, median: 0, p95: 0, count: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  return { mean, median, p95, count: sorted.length };
}

function makePlayer(id: string, leaderIndex: number): PlayerState {
  return {
    id,
    isHuman: false,
    leader: LEADER_PERSONALITIES[leaderIndex % LEADER_PERSONALITIES.length],
    sciencePoints: 0,
    culturePoints: 0,
    researchedTechIds: [],
    researching: null,
  };
}

function fakeGameState(seed: string, size: number, leaderCount: number): GameState {
  const world = generateWorld(seed, size, size);
  const players: PlayerState[] = [];
  for (let i = 0; i < leaderCount; i++) players.push(makePlayer(`AI-${i + 1}`, i));
  const techCatalog: TechNode[] = [];
  return {
    schemaVersion: 1,
    seed,
    turn: 0,
    map: { width: size, height: size, tiles: world.tiles },
    players,
    techCatalog,
    rngState: world.state,
    log: [],
    mode: 'ai-sim',
    autoSim: false,
  };
}

async function runConfig(seed: string, size: number, leaderCount: number, iterations: number) {
  const timings: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const state = fakeGameState(`${seed}-${i}`, size, leaderCount);
    for (const p of state.players) {
      const t0 = process.hrtime.bigint();
      evaluateAI(p, state);
      const t1 = process.hrtime.bigint();
      timings.push(Number(t1 - t0) / 1e6); // ms
    }
  }
  return computeStats(timings);
}

async function main() {
  const iterations = Number(process.argv[2]) || 50;
  const seeds = ['bench-1', 'bench-2'];
  const mapSizes = [30, 50];
  const leaderCounts = [4];
  const configs: any[] = [];

  for (const seed of seeds) {
    for (const size of mapSizes) {
      for (const leaders of leaderCounts) {
        const stats = await runConfig(seed, size, leaders, iterations);
        configs.push({ seed, mapSize: size, leaderCount: leaders, stats });
      }
    }
  }

  const report = { generatedAt: new Date().toISOString(), iterations, configs };
  const dir = path.resolve('test-results');
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `ai-bench-${report.generatedAt.replace(/[:.]/g, '-')}.json`);
  await writeFile(filePath, JSON.stringify(report, null, 2));
  console.log(`AI bench results written to ${filePath}`);
}

main().catch((err) => {
  console.error('Benchmark failed', err);
  process.exit(1);
});
