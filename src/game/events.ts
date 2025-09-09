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

  on<K extends keyof E & string>(event: K, function_: Listener<E[K]>) {
    const set = this.listeners.get(event) ?? new Set();
    set.add(function_ as Listener<any>);
    this.listeners.set(event, set);
    return () => this.off(event, function_);
  }

  off<K extends keyof E & string>(event: K, function_: Listener<E[K]>) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(function_ as Listener<any>);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit<K extends keyof E & string>(event: K, payload: E[K]) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const function_ of set) {
      try {
        function_(payload);
      } catch (error) {
        console.error('Event listener error', error);
      }
    }
  }
}

export const globalGameBus = new GameEventBus<GameEvents>();
