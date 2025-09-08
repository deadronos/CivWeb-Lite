import { GameAction } from '../actions';
import { GameState } from '../types';
import { applyAction } from '../reducer';

// Stable stringify to ensure identical key order for hashing
function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const stringify = (val: any): any => {
    if (val && typeof val === 'object') {
      if (seen.has(val)) return '[Circular]';
      seen.add(val);
      if (Array.isArray(val)) return val.map(stringify);
      const keys = Object.keys(val).sort();
      const obj: Record<string, any> = {};
      for (const k of keys) obj[k] = stringify(val[k]);
      return obj;
    }
    return val;
  };
  return JSON.stringify(stringify(value));
}

// Simple djb2 hash over the stable-stringified state
export function hashState(state: GameState): string {
  const str = stableStringify(state);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export type Replay = {
  actions: GameAction[];
  startSeed?: string;
};

export function runReplay(initial: GameState, replay: Replay): { final: GameState; hash: string } {
  let state = initial;
  for (const act of replay.actions) {
    state = applyAction(state, act);
  }
  return { final: state, hash: hashState(state) };
}

export function record(...actions: GameAction[]): Replay {
  return { actions };
}

