import Ajv from 'ajv';
import saveSchema from '../../../schema/save.schema.json';
import { GameState } from '../types';

/**
 * Current version of the save file schema.
 * Increment when the serialized shape changes and maintain compatibility
 * in {@link deserializeState}.
 */
export const SCHEMA_VERSION = 1;

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile<GameState>(saveSchema as any);

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
  const valid = validate(data);
  if (!valid) {
    throw new ValidationError(ajv.errorsText(validate.errors));
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
  return deserializeState(text);
}
