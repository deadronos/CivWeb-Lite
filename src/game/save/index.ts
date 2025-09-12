import { GameState } from '../types';
import { ensureValidator, getAjvInstance } from './validator';

/**
 * @file This file contains functions for saving and loading the game state.
 */

/**
 * The current version of the save file schema.
 */
export const SCHEMA_VERSION = 1;

/**
 * An error that is thrown when the save file schema version does not match the current version.
 */
export class VersionMismatchError extends Error {
  constructor() {
    super();
    this.name = 'VersionMismatchError';
  }
}

/**
 * An error that is thrown when the save file fails validation.
 */
export class ValidationError extends Error {
  constructor() {
    super();
    this.name = 'ValidationError';
  }
}

/**
 * An error that is thrown when the save file exceeds the maximum size.
 */
export class SizeExceededError extends Error {
  constructor() {
    super();
    this.name = 'SizeExceededError';
  }
}

/**
 * Serializes the game state to a JSON string.
 * @param state - The game state to serialize.
 * @returns The serialized game state.
 */
export function serializeState(state: GameState): string {
  const { ...clone } = state;
  return JSON.stringify(clone);
}

/**
 * Deserializes the game state from a JSON string.
 * @param json - The JSON string to deserialize.
 * @returns The deserialized game state.
 * @throws {VersionMismatchError} If the schema version does not match.
 * @throws {ValidationError} If the save file fails validation.
 */
export function deserializeState(json: string): GameState {
  const data = JSON.parse(json);
  if (typeof data.schemaVersion !== 'number' || data.schemaVersion !== SCHEMA_VERSION) {
    throw new VersionMismatchError(
      `Expected schemaVersion ${SCHEMA_VERSION} but received ${data.schemaVersion}`
    );
  }
  const validateFunction = ensureValidator();
  const valid = validateFunction(data as any);
  if (!valid) {
    // Use the AJV instance to format errors if available
    const ajv = getAjvInstance();
    const text = ajv ? ajv.errorsText((validateFunction as any).errors) : 'Validation failed';
    throw new ValidationError(text);
  }
  return data as GameState;
}

/**
 * Exports the game state to a file.
 * @param state - The game state to export.
 * @param filename - The name of the file to export to.
 */
export function exportToFile(state: GameState, filename = 'save.json') {
  const blob = new Blob([serializeState(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports the game state from a file.
 * @param file - The file to import from.
 * @returns A promise that resolves to the imported game state.
 * @throws {SizeExceededError} If the save file exceeds the maximum size.
 */
export async function importFromFile(file: File): Promise<GameState> {
  if (file.size > 2 * 1024 * 1024) {
    throw new SizeExceededError('Save file exceeds 2MB');
  }
  const text = await file.text();
  // Ensure validator is ready before deserializing (lazy-loaded).
  ensureValidator();
  return deserializeState(text);
}
