import { GameState, GameLogEntry } from './types';

/**
 * @file This file contains utility functions for logging game events.
 */

export const DEFAULT_LOG_CAPACITY = 50;

/**
 * Appends a log entry to the game state's log, and removes the oldest entry if the log exceeds its capacity.
 * @param stateDraft - The draft of the game state to modify.
 * @param entry - The log entry to append.
 * @param capacity - The maximum number of log entries to store.
 */
export function appendLog(
  stateDraft: GameState,
  entry: GameLogEntry,
  capacity = DEFAULT_LOG_CAPACITY
) {
  stateDraft.log.push(entry);
  if (stateDraft.log.length > capacity) stateDraft.log.shift();
}

/**
 * Creates a ring logger, which is a fixed-size buffer of log entries.
 * @param capacity - The maximum number of log entries to store.
 * @returns An object with methods for recording, reading, and clearing log entries.
 */
export function createRingLogger(capacity = DEFAULT_LOG_CAPACITY) {
  const buffer: GameLogEntry[] = [];
  return {
    /**
     * Records a new log entry.
     * @param entry - The log entry to record.
     */
    record(entry: GameLogEntry) {
      buffer.push(entry);
      if (buffer.length > capacity) buffer.shift();
    },
    /**
     * Reads all log entries from the buffer.
     * @returns A readonly array of log entries.
     */
    read(): Readonly<GameLogEntry[]> {
      return buffer;
    },
    /**
     * Clears all log entries from the buffer.
     */
    clear() {
      buffer.length = 0;
    },
  };
}
