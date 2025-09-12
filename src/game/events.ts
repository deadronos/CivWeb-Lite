import { GameAction } from './actions';

type Listener<T> = (payload: T) => void;

export interface GameEvents {
  'turn:start': { turn: number };
  'turn:end': { turn: number };
  'turn:playerStart': { playerId: string; turn: number };
  'turn:playerEnd': { playerId: string; turn: number };
  'action:applied': { action: GameAction };
  'tech:unlocked': { playerId: string; techId: string };
  'unit:selected': { unitId: string };
  'actionAccepted': { requestId: string; appliedAtTick: number };
  'actionRejected': { requestId: string; reason: string };
  'actionsResolved': { tick: number; results: any[] };
  'combatResolved': { tick: number; combats: any[] };
  'productionCompleted': { cityId: string; itemId: string; spawnedEntityId?: string };
  'productionQueued': { cityId: string; order: any };
  'researchProgress': { playerId: string; techId: string; progress: number; completed?: boolean };
  'researchStarted': { playerId: string; techId: string };
  'researchQueued': { playerId: string; techId: string };
  'city:found': { cityId: string; ownerId: string; tileId: string };
  // AI events
  'ai:turnStart': { playerId: string; turn: number };
  'ai:turnEnd': { playerId: string; turn: number };
  'ai:decisions': { playerId: string; actions: GameAction[]; duration: number };
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
