import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import {
  NewGameActionSchema,
  IssueMoveActionSchema,
  StartResearchActionSchema,
  ExtAddUnitActionSchema as ExtensionAddUnitActionSchema,
  SetPlayerScoresActionSchema,
  GameActionSchema,
} from '../schema/action.schema';

describe('action payload examples - schema validation', () => {
  test('NEW_GAME valid and invalid payloads', () => {
    // valid
    const good = {
      type: 'NEW_GAME',
      payload: { totalPlayers: 4, seed: 'abc123', width: 10, height: 10 },
    };
    expect(() => NewGameActionSchema.parse(good)).not.toThrow();

    // invalid: missing required totalPlayers
    const bad = { type: 'NEW_GAME', payload: { seed: 'no-players' } };
    expect(() => NewGameActionSchema.parse(bad)).toThrow();
  });

  test('ISSUE_MOVE valid and invalid payloads', () => {
    const valid = { type: 'ISSUE_MOVE', payload: { unitId: 'u1', path: ['t1', 't2', 't3'] } };
    expect(() => IssueMoveActionSchema.parse(valid)).not.toThrow();

    // invalid: path must be array of strings
    const invalidPath = { type: 'ISSUE_MOVE', payload: { unitId: 'u1', path: 'not-an-array' } };
    expect(() => IssueMoveActionSchema.parse(invalidPath)).toThrow();
  });

  test('START_RESEARCH valid and invalid payloads', () => {
    const ok = { type: 'START_RESEARCH', payload: { playerId: 'p1', techId: 'wheel' } };
    expect(() => StartResearchActionSchema.parse(ok)).not.toThrow();

    const missing = { type: 'START_RESEARCH', payload: { playerId: 'p1' } };
    expect(() => StartResearchActionSchema.parse(missing)).toThrow();
  });

  test('EXT_ADD_UNIT valid and invalid payloads', () => {
    const ok = { type: 'EXT_ADD_UNIT', payload: { unitId: 'u9', type: 'warrior', ownerId: 'p1', tileId: 't10' } };
    expect(() => ExtensionAddUnitActionSchema.parse(ok)).not.toThrow();

    const missingFields = { type: 'EXT_ADD_UNIT', payload: { unitId: 'u9' } };
    expect(() => ExtensionAddUnitActionSchema.parse(missingFields)).toThrow();
  });

  test('SET_PLAYER_SCORES valid and invalid payloads', () => {
    const ok = {
      type: 'SET_PLAYER_SCORES',
      payload: { players: [{ id: 'p1', sciencePoints: 10, culturePoints: 5 }] },
    };
    expect(() => SetPlayerScoresActionSchema.parse(ok)).not.toThrow();

    // invalid: sciencePoints must be a number
    const invalid = { type: 'SET_PLAYER_SCORES', payload: { players: [{ id: 'p1', sciencePoints: 'ten' }] } } as unknown;
    expect(() => SetPlayerScoresActionSchema.parse(invalid)).toThrow();
  });

  test('GameActionSchema discriminated union accepts known actions', () => {
    const actions = [
      { type: 'NEW_GAME', payload: { totalPlayers: 2 } },
      { type: 'ISSUE_MOVE', payload: { unitId: 'u1', path: ['t1'] } },
      { type: 'START_RESEARCH', payload: { playerId: 'p1', techId: 'x' } },
    ];
    for (const a of actions) {
      expect(() => GameActionSchema.parse(a)).not.toThrow();
    }
  });
});
