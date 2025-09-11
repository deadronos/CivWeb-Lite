import {
  serializeState,
  deserializeState,
  VersionMismatchError,
  ValidationError,
} from '../src/game/save';
import { initialStateForTests } from '../src/contexts/game-provider';

describe('save/load roundtrip', () => {
  test('roundtrip retains state', () => {
    const state = initialStateForTests();
    const json = serializeState(state);
    const loaded = deserializeState(json);
    expect(loaded).toEqual(state);
  });

  test('rejects invalid schema', () => {
    const bad = '{"schemaVersion":1}';
    expect(() => deserializeState(bad)).toThrow(ValidationError);
  });

  test('rejects version mismatch', () => {
    const state = initialStateForTests();
    const json = JSON.stringify({ ...state, schemaVersion: 999 });
    expect(() => deserializeState(json)).toThrow(VersionMismatchError);
  });
});
