import { seedFrom, next, RNGState } from '../rng';
import { BiomeType, Tile } from '../types';
import { DEFAULT_MAP_SIZE } from './config';

// Periodic cosine-based fractal noise. Horizontal axis (q) is fully periodic
// so left/right edges wrap seamlessly. Vertical axis (r) is non-periodic.
function cosineFractal(
  x: number, // 0..1
  y: number, // 0..1
  phases: number[],
  freqsX: number[],
  freqsY: number[],
  amps: number[]
): number {
  let sum = 0;
  let ampSum = 0;
  for (let i = 0; i < amps.length; i++) {
    const a = amps[i];
    const px = freqsX[i] * x * 2 * Math.PI + phases[i]; // periodic in x
    const py = freqsY[i] * y * 2 * Math.PI + phases[(i + 1) % phases.length];
    sum += a * (Math.cos(px + py) * 0.5 + 0.5);
    ampSum += a;
  }
  return sum / (ampSum || 1);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function chooseBiome(e: number, m: number, lat: number): BiomeType {
  // Order matters: ocean/ice/mountain first
  const waterline = 0.48; // tuned for continent sizes
  if (e < waterline) return BiomeType.Ocean;
  if (e > 0.86) return BiomeType.Mountain;

  // Temperature proxy from latitude (0 at poles, 1 at equator)
  const temp = 1 - Math.abs(2 * lat - 1); // 0..1, hot near equator

  // Rough biome decision table
  if (temp < 0.2) return m > 0.6 ? BiomeType.Tundra : BiomeType.Ice; // very cold
  if (temp < 0.35) return m > 0.5 ? BiomeType.Tundra : BiomeType.Grassland;
  if (temp > 0.8 && m < 0.35) return BiomeType.Desert;
  if (m > 0.65) return BiomeType.Forest;
  return BiomeType.Grassland;
}

export function generateWorld(
  seed: string | RNGState,
  width = DEFAULT_MAP_SIZE.width,
  height = DEFAULT_MAP_SIZE.height
): { tiles: Tile[]; state: RNGState } {
  let rng = typeof seed === 'string' ? seedFrom(seed) : seed;

  // Phases/frequencies for fractal layers (low frequencies for continent feel)
  const phases: number[] = [];
  const freqsX: number[] = [];
  const freqsY: number[] = [];
  const amps: number[] = [];
  const layers = 4;
  for (let i = 0; i < layers; i++) {
    const p = next(rng); rng = p.state; phases.push(p.value * Math.PI * 2);
    const fx = 1 + i; // 1,2,3,4 cycles across width (wrap safe)
    const fy = 1 + Math.floor(i / 2); // slower vertical variation
    freqsX.push(fx);
    freqsY.push(fy);
    amps.push(1 / (i + 1)); // diminishing amplitude
  }

  // Separate moisture field
  const phasesM: number[] = [];
  const freqsXM: number[] = [];
  const freqsYM: number[] = [];
  const ampsM: number[] = [];
  for (let i = 0; i < layers; i++) {
    const p = next(rng); rng = p.state; phasesM.push(p.value * Math.PI * 2);
    const fx = 1 + ((i + 1) % 3);
    const fy = 1 + Math.floor((i + 2) / 2);
    freqsXM.push(fx);
    freqsYM.push(fy);
    ampsM.push(1 / (i + 1));
  }

  const tiles: Tile[] = [];
  const iceBand = Math.max(2, Math.round(height * 0.06)); // ~2-3 rows for typical sizes

  for (let r = 0; r < height; r++) {
    const y = r / Math.max(1, height - 1);
    const inPolar = r < iceBand || r >= height - iceBand;
    for (let q = 0; q < width; q++) {
      const x = q / Math.max(1, width);

      // Elevation and moisture fields (0..1)
      let elevation = cosineFractal(x, y, phases, freqsX, freqsY, amps);
      let moisture = cosineFractal(x, y, phasesM, freqsXM, freqsYM, ampsM);

      // Latitude modifiers: more ocean near poles, more humidity near equator
      const lat = y; // 0 top .. 1 bottom
      const equator = 1 - Math.abs(2 * lat - 1); // 0 at poles, 1 at equator
      elevation = clamp01(elevation + (equator - 0.5) * 0.12);
      moisture = clamp01(moisture + (equator - 0.5) * 0.18);

      // Hard polar caps override
      let biome: BiomeType;
      if (inPolar) {
        biome = BiomeType.Ice;
      } else {
        biome = chooseBiome(elevation, moisture, lat);
      }

      tiles.push({
        id: `${q},${r}`,
        coord: { q, r },
        biome,
        elevation,
        moisture,
        exploredBy: [],
      });
    }
  }
  return { tiles, state: rng };
}
