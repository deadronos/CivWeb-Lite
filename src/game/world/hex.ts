import { HexCoord } from '../types';

/**
 * @file This file contains utility functions for working with hexagonal coordinates.
 */

/**
 * An array of the six hexagonal directions.
 */
export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

/**
 * Adds two hexagonal coordinates.
 * @param a - The first coordinate.
 * @param b - The second coordinate.
 * @returns The sum of the two coordinates.
 */
export function add(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

/**
 * Gets the neighbors of a hexagonal coordinate.
 * @param c - The coordinate.
 * @param width - The width of the map, for wrapping.
 * @param height - The height of the map, for wrapping.
 * @returns An array of the six neighbors.
 */
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

/**
 * Calculates the distance between two hexagonal coordinates.
 * @param a - The first coordinate.
 * @param b - The second coordinate.
 * @returns The distance between the two coordinates.
 */
export function distance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}
