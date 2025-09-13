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

export class VersionMismatchError extends Error {
  constructor() {
    super();
    this.name = 'VersionMismatchError';
  }
}
export class ValidationError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
export class SizeExceededError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'SizeExceededError';
  }
}

export function serializeState(state: GameState): string {
  const { ...clone } = state;
  return JSON.stringify(clone);
}

export function deserializeState(json: string): GameState {
  const data = JSON.parse(json);
  if (typeof data.schemaVersion !== 'number' || data.schemaVersion !== SCHEMA_VERSION) {
    // Keep readable message but cast to any for older consumers that expect zero-arg constructors
    throw (new VersionMismatchError() as any);
  }
  const validateFunction = ensureValidator();
  const valid = validateFunction(data as any);
  if (!valid) {
    // Use the AJV instance to format errors if available
    const ajv = getAjvInstance();
    const text = ajv ? ajv.errorsText((validateFunction as any).errors) : 'Validation failed';
  throw (new ValidationError(text) as any);
  }
  return data as GameState;
}

export function exportToFile(state: GameState, filename = 'save.json') {
  const blob = new Blob([serializeState(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.target = '_self';
  // Append to DOM to improve cross-browser compatibility and Playwright detection
  document.body.append(a);
  a.click();
  // Give the browser a tick to register the download before revoking the URL
  setTimeout(() => {
    // Prefer modern API, but fall back for environments (e.g., jsdom) that may not implement it
    if (typeof (a as any).remove === 'function') {
      a.remove();
    } else if (a.parentNode) {
  // Fallback for environments missing Element#remove; jsdom in tests may not implement modern DOM APIs
  // eslint-disable-next-line unicorn/prefer-dom-node-remove -- ensure compatibility in non-browser test envs
      a.parentNode.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 50);
}

export async function importFromFile(file: File): Promise<GameState> {
  if (file.size > 2 * 1024 * 1024) {
  throw (new SizeExceededError('Save file exceeds 2MB') as any);
  }
  const text = await file.text();
  // Ensure validator is ready before deserializing (lazy-loaded).
  ensureValidator();
  return deserializeState(text);
}
