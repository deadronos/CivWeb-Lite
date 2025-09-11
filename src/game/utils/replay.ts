import { GameAction } from '../actions';
import { GameState } from '../types';
import { applyAction } from '../reducer';

// Stable stringify to ensure identical key order for hashing
function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const stringify = (value_: any): any => {
    if (value_ === null) return null;
    const t = typeof value_;
    if (t === 'bigint') {
      // Represent BigInt distinctly to preserve full precision deterministically.
      return `${value_.toString()}n`;
    }
    if (t === 'number') {
      // JSON.stringify keeps NaN/Infinity as null; mimic that for determinism.
      return Number.isFinite(value_) ? value_ : null;
    }
    if (t === 'string' || t === 'boolean') return value_;
    if (t === 'object') {
      if (seen.has(value_)) return '[Circular]';
      seen.add(value_);
      if (Array.isArray(value_)) return value_.map((v) => stringify(v));
      const keys = Object.keys(value_).sort();
      const object: Record<string, any> = {};
      for (const k of keys) {
        const v = (value_ as any)[k];
        if (v === undefined || typeof v === 'function' || typeof v === 'symbol') continue; // skip per JSON spec
        object[k] = stringify(v);
      }
      return object;
    }
    // undefined, function, symbol (only appear within arrays -> becomes null; objects skipped above)
    return t === 'undefined' ? undefined : null;
  };
  return JSON.stringify(stringify(value));
}

// Simple djb2 hash over the stable-stringified state
// Decode textual BigInt markers (e.g. "123n") back into BigInt numbers.
export function decodeBigIntMarkers<T>(object: T): T {
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
  return visit(object) as T;
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

import { createHash } from 'node:crypto';

export async function hashState(state: GameState): Promise<string> {
  const string_ = stableStringify(state);
  // Use Web Crypto API when available (browser-friendly). Fallback to Node's crypto.
  const encoder = new TextEncoder();
  const data = encoder.encode(string_);
  // Prefer globalThis.crypto.subtle
  const subtle = (globalThis as any).crypto && (globalThis as any).crypto.subtle;
  if (subtle && typeof subtle.digest === 'function') {
    const buf = await subtle.digest('SHA-256', data);
    // convert buffer to hex
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    return hex;
  }
  // Node static import fallback
  return createHash('sha256').update(string_, 'utf8').digest('hex');
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
