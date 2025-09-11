import { HexCoord } from '../types';

export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function add(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function neighbors(c: HexCoord, width?: number, height?: number): HexCoord[] {
  return HEX_DIRECTIONS.map((d) => {
    let q = c.q + d.q;
    let r = c.r + d.r;
    if (typeof width === 'number') {
      q = ((q % width) + width) % width;
    }
    if (typeof height === 'number') {
      r = ((r % height) + height) % height;
    }
    return { q, r };
  });
}

export function distance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}
