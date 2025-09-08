type Listener<T = any> = (payload: T) => void;

export class GameEventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  on<T = any>(event: string, fn: Listener<T>) {
    const set = this.listeners.get(event) ?? new Set();
    set.add(fn as Listener);
    this.listeners.set(event, set);
    return () => this.off(event, fn);
  }

  off<T = any>(event: string, fn: Listener<T>) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(fn as Listener);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit<T = any>(event: string, payload?: T) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of Array.from(set)) {
      try {
        fn(payload as T);
      } catch (e) {
        // swallow errors in listeners
        // eslint-disable-next-line no-console
        console.error('Event listener error', e);
      }
    }
  }
}

export const globalGameBus = new GameEventBus();
