import { GameState } from '../types';
import { ensureValidator, getAjvInstance } from './validator';

/**
 * Current version of the save file schema.
 * Increment when the serialized shape changes and maintain compatibility
 * in {@link deserializeState}.
 */
export const SCHEMA_VERSION = 1;

// use validator helper to lazy-load AJV
// ensureValidator will compile the schema on first use

export class VersionMismatchError extends Error {}
export class ValidationError extends Error {}
export class SizeExceededError extends Error {}

export function serializeState(state: GameState): string {
  const { ...clone } = state;
  return JSON.stringify(clone);
}

export function deserializeState(json: string): GameState {
  const data = JSON.parse(json);
  if (typeof data.schemaVersion !== 'number' || data.schemaVersion !== SCHEMA_VERSION) {
    throw new VersionMismatchError(`Expected schemaVersion ${SCHEMA_VERSION} but received ${data.schemaVersion}`);
  }
  const validateFn = ensureValidator();
  const valid = validateFn(data as any);
  if (!valid) {
    // Use the AJV instance to format errors if available
    const ajv = getAjvInstance();
    const text = ajv ? ajv.errorsText((validateFn as any).errors) : 'Validation failed';
    throw new ValidationError(text);
  }
  return data as GameState;
}

export function exportToFile(state: GameState, filename = 'save.json') {
  const blob = new Blob([serializeState(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromFile(file: File): Promise<GameState> {
  if (file.size > 2 * 1024 * 1024) {
    throw new SizeExceededError('Save file exceeds 2MB');
  }
  const text = await file.text();
  // Ensure validator is ready before deserializing (lazy-loaded).
  ensureValidator();
  return deserializeState(text);
}
