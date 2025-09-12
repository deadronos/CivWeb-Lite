import { Tile, BiomeType } from '../../game/types';

/**
 * @file This file contains functions for generating procedural biome colors.
 */

/**
 * A small deterministic hash for (q,r) based on bit-mixing.
 * @param q - The q coordinate.
 * @param r - The r coordinate.
 * @returns A hash value between 0 and 1.
 */
function hash2(q: number, r: number): number {
  let x = (q | 0) * 374_761_393 + (r | 0) * 668_265_263;
  x = (x ^ (x >>> 13)) * 1_274_126_177;
  x = x ^ (x >>> 16);
  // 0..1
  return (x >>> 0) / 0xff_ff_ff_ff;
}

/**
 * Clamps a number between 0 and 1.
 * @param n - The number to clamp.
 * @returns The clamped number.
 */
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Converts HSL (0-1) to a hex string.
 * @param h - The hue.
 * @param s - The saturation.
 * @param l - The lightness.
 * @returns The hex color string.
 */
function hsl(h: number, s: number, l: number): string {
  // Adapted lightweight HSL->RGB
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const col = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * col);
  };
  const r = f(0),
    g = f(8),
    b = f(4);
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generates a procedural biome color with subtle variation by elevation/moisture and a stable per-tile jitter.
 * @param t - The tile to generate the color for.
 * @returns A hex color string (e.g., #33aa77).
 */
export function colorForTile(t: Tile): string {
  const { q, r } = t.coord;
  const jitter = hash2(q, r) * 2 - 1; // -1..1
  // Base palette per biome using HSL (h,s,l)
  // Hues picked to be readable against the dark UI theme.
  let h = 0.5; // green
  let s = 0.6;
  let l = 0.5;
  switch (t.biome) {
    case BiomeType.Ocean: {
      h = 0.57;
      s = 0.65;
      l = 0.3; // deep blue
      // Slightly lighter in shallow (higher elevation near shore)
      l += (t.elevation - 0.5) * 0.1;
      break;
    }
    case BiomeType.Grassland: {
      h = 0.33;
      s = 0.55;
      l = 0.44; // mid green
      // Wetter -> richer (more saturation), higher -> lighter
      s += (t.moisture - 0.5) * 0.15;
      l += (t.elevation - 0.5) * 0.1;
      break;
    }
    case BiomeType.Forest: {
      h = 0.33;
      s = 0.65;
      l = 0.3; // dark green
      s += (t.moisture - 0.5) * 0.1;
      l += (t.elevation - 0.5) * 0.06;
      break;
    }
    case BiomeType.Desert: {
      h = 0.12;
      s = 0.7;
      l = 0.6; // yellow/orange sand
      s -= t.moisture * 0.2; // drier -> more saturated
      l += (t.elevation - 0.5) * 0.06;
      break;
    }
    case BiomeType.Mountain: {
      h = 0.62;
      s = 0.05;
      l = 0.55; // grayish
      l += (t.elevation - 0.7) * 0.2; // higher -> lighter (snow caps hint)
      break;
    }
    case BiomeType.Tundra: {
      h = 0.58;
      s = 0.08;
      l = 0.8; // pale blue-gray
      l += (t.moisture - 0.5) * 0.05;
      break;
    }
    case BiomeType.Ice: {
      h = 0.58;
      s = 0.05;
      l = 0.92; // near white
      break;
    }
  }
  // Add tiny jitter and clamp
  l = clamp01(l + jitter * 0.03);
  s = clamp01(s + jitter * 0.02);
  return hsl(h % 1, clamp01(s), clamp01(l));
}

/**
 * Gets the base, stable color for a biome (no per-tile variation).
 * @param b - The biome type.
 * @returns The hex color string.
 */
export function baseColorForBiome(b: BiomeType): string {
  switch (b) {
    case BiomeType.Ocean: {
      return hsl(0.57, 0.65, 0.3);
    }
    case BiomeType.Grassland: {
      return hsl(0.33, 0.55, 0.44);
    }
    case BiomeType.Forest: {
      return hsl(0.33, 0.65, 0.3);
    }
    case BiomeType.Desert: {
      return hsl(0.12, 0.7, 0.6);
    }
    case BiomeType.Mountain: {
      return hsl(0.62, 0.05, 0.55);
    }
    case BiomeType.Tundra: {
      return hsl(0.58, 0.08, 0.8);
    }
    case BiomeType.Ice: {
      return hsl(0.58, 0.05, 0.92);
    }
  }
}

/**
 * Returns a slight shade variation for a biome bucket index.
 * @param b - The biome type.
 * @param index - The index of the bucket.
 * @param total - The total number of buckets.
 * @returns The hex color string.
 */
export function colorForBiomeBucket(b: BiomeType, index: number, total: number): string {
  const t = total <= 1 ? 0.5 : index / (total - 1); // 0..1
  // Adjust lightness around the base per-biome color by +/- 6%
  let h = 0.5,
    s = 0.6,
    l = 0.5;
  switch (b) {
    case BiomeType.Ocean: {
      h = 0.57;
      s = 0.65;
      l = 0.3;
      break;
    }
    case BiomeType.Grassland: {
      h = 0.33;
      s = 0.55;
      l = 0.44;
      break;
    }
    case BiomeType.Forest: {
      h = 0.33;
      s = 0.65;
      l = 0.3;
      break;
    }
    case BiomeType.Desert: {
      h = 0.12;
      s = 0.7;
      l = 0.6;
      break;
    }
    case BiomeType.Mountain: {
      h = 0.62;
      s = 0.05;
      l = 0.55;
      break;
    }
    case BiomeType.Tundra: {
      h = 0.58;
      s = 0.08;
      l = 0.8;
      break;
    }
    case BiomeType.Ice: {
      h = 0.58;
      s = 0.05;
      l = 0.92;
      break;
    }
  }
  const delta = (t - 0.5) * 0.12; // +/- 0.06
  return hsl(h, s, Math.max(0, Math.min(1, l + delta)));
}
