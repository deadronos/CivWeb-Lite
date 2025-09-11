import { GameState, GameLogEntry } from './types';

export const DEFAULT_LOG_CAPACITY = 50;

export function appendLog(
  stateDraft: GameState,
  entry: GameLogEntry,
  capacity = DEFAULT_LOG_CAPACITY
) {
  stateDraft.log.push(entry);
  if (stateDraft.log.length > capacity) stateDraft.log.shift();
}

export function createRingLogger(capacity = DEFAULT_LOG_CAPACITY) {
  const buffer: GameLogEntry[] = [];
  return {
    record(entry: GameLogEntry) {
      buffer.push(entry);
      if (buffer.length > capacity) buffer.shift();
    },
    read(): Readonly<GameLogEntry[]> {
      return buffer;
    },
    clear() {
      buffer.length = 0;
    },
  };
}
