import { GameAction } from '../actions';
import { GameState } from '../types';
import { applyAction } from '../reducer';

// Stable stringify to ensure identical key order for hashing
function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const stringify = (val: any): any => {
    if (val === null) return null;
    const t = typeof val;
    if (t === 'bigint') {
      // Represent BigInt distinctly to preserve full precision deterministically.
      return `${val.toString()}n`;
    }
    if (t === 'number') {
      // JSON.stringify keeps NaN/Infinity as null; mimic that for determinism.
      return Number.isFinite(val) ? val : null;
    }
    if (t === 'string' || t === 'boolean') return val;
    if (t === 'object') {
      if (seen.has(val)) return '[Circular]';
      seen.add(val);
      if (Array.isArray(val)) return val.map((v) => stringify(v));
      const keys = Object.keys(val).sort();
      const obj: Record<string, any> = {};
      for (const k of keys) {
        const v = (val as any)[k];
        if (typeof v === 'undefined' || typeof v === 'function' || typeof v === 'symbol') continue; // skip per JSON spec
        obj[k] = stringify(v);
      }
      return obj;
    }
    // undefined, function, symbol (only appear within arrays -> becomes null; objects skipped above)
    return t === 'undefined' ? undefined : null;
  };
  return JSON.stringify(stringify(value));
}

// Simple djb2 hash over the stable-stringified state
// Decode textual BigInt markers (e.g. "123n") back into BigInt numbers.
export function decodeBigIntMarkers<T>(obj: T): T {
  const visit = (v: any): any => {
    if (v === null) return null;
    const t = typeof v;
    if (t === 'string') {
      // match optional leading - then digits then 'n' marker
      if (/^-?\d+n$/.test(v)) return BigInt(v.slice(0, -1));
      return v;
    }
    if (t === 'object') {
      if (Array.isArray(v)) return v.map(visit);
      const out: Record<string, any> = {};
      for (const k of Object.keys(v)) {
        out[k] = visit(v[k]);
      }
      return out as any;
    }
    return v;
  };
  return visit(obj) as T;
}

// Parse a serialized JSON string and decode BigInt markers back into BigInt values.
export function parseState(serialized: string): any {
  const parsed = JSON.parse(serialized);
  return decodeBigIntMarkers(parsed);
}

// Helper to produce a stable JSON string suitable for persistence
export function stringifyState(state: unknown): string {
  return stableStringify(state);
}

import { createHash } from 'crypto';

export async function hashState(state: GameState): Promise<string> {
  const str = stableStringify(state);
  // Use Web Crypto API when available (browser-friendly). Fallback to Node's crypto.
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  // Prefer globalThis.crypto.subtle
  const subtle = (globalThis as any).crypto && (globalThis as any).crypto.subtle;
  if (subtle && typeof subtle.digest === 'function') {
    const buf = await subtle.digest('SHA-256', data);
    // convert buffer to hex
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hex;
  }
  // Node static import fallback
  return createHash('sha256').update(str, 'utf8').digest('hex');
}

export type Replay = {
  actions: GameAction[];
  startSeed?: string;
};

export async function runReplay(
  initial: GameState,
  replay: Replay
): Promise<{ final: GameState; hash: string }> {
  let state = initial;
  for (const act of replay.actions) {
    state = applyAction(state, act);
  }
  return { final: state, hash: await hashState(state) };
}

export function record(...actions: GameAction[]): Replay {
  return { actions };
}
