import { performance } from 'node:perf_hooks';
import { initialState as makeInitial } from '../src/contexts/GameProvider';
import { applyAction } from '../src/game/reducer';

function benchTurns(width: number, height: number, turns: number): number[] {
  let state = makeInitial();
  state = applyAction(state, { type: 'INIT', payload: { seed: 'bench', width, height } });
  const samples: number[] = [];
  for (let i = 0; i < turns; i++) {
    const t0 = performance.now();
    state = applyAction(state, { type: 'END_TURN' });
    const t1 = performance.now();
    samples.push(t1 - t0);
  }
  return samples;
}

function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  return { mean, p95, count: sorted.length };
}

function run() {
  const sizes = [30, 50, 100];
  const perSize: Record<string, any> = {};
  for (const s of sizes) {
    const samples = benchTurns(s, s, 20);
    perSize[`${s}x${s}`] = stats(samples);
  }
  console.log(JSON.stringify(perSize, null, 2));
}

run();

