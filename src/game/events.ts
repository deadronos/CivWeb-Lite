import { GameAction } from './actions';

type Listener<T> = (payload: T) => void;

export interface GameEvents {
  'turn:start': { turn: number };
  'turn:end': { turn: number };
  'action:applied': { action: GameAction };
  'tech:unlocked': { playerId: string; techId: string };
}

export class GameEventBus<E extends Record<string, any>> {
  private listeners: Map<keyof E & string, Set<Listener<any>>> = new Map();

  on<K extends keyof E & string>(event: K, fn: Listener<E[K]>) {
    const set = this.listeners.get(event) ?? new Set();
    set.add(fn as Listener<any>);
    this.listeners.set(event, set);
    return () => this.off(event, fn);
  }

  off<K extends keyof E & string>(event: K, fn: Listener<E[K]>) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(fn as Listener<any>);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit<K extends keyof E & string>(event: K, payload: E[K]) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of Array.from(set)) {
      try {
        fn(payload);
      } catch (e) {
        console.error('Event listener error', e);
      }
    }
  }
}

export const globalGameBus = new GameEventBus<GameEvents>();
