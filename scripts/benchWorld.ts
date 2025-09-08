import { performance } from 'node:perf_hooks';
import { generateWorld } from '../src/game/world/generate';

const start = performance.now();
generateWorld('benchmark', 30, 30);
const end = performance.now();
console.log(`World generation 30x30 took ${(end - start).toFixed(2)}ms`);
