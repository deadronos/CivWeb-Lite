import { expect, test } from 'vitest';
import { GameActionSchema, AnyActionSchema } from '../schema/action.schema';

test('valid move action passes strict schema', () => {
  const move = { type: 'move', unitId: 'u1', path: ['t1', 't2'] };
  expect(() => GameActionSchema.parse(move)).not.toThrow();
});

test('log event accepted by permissive schema and included in GameActionSchema', () => {
  const log = { type: 'LOG_EVENT', payload: { entry: { timestamp: Date.now(), type: 'turn:start' } } };
  expect(() => AnyActionSchema.parse(log)).not.toThrow();
  // GameActionSchema should also accept LOG_EVENT after schema extension
  expect(() => GameActionSchema.parse(log)).not.toThrow();
});
import { expect, test } from 'vitest';
import { GameActionSchema } from '../schema/action.schema';

test('valid move action passes schema', () => {
  const a = { type: 'move', unitId: 'u1', path: ['t1', 't2'] };
  expect(() => GameActionSchema.parse(a as any)).not.toThrow();
});

test('invalid move action (missing unitId) fails schema', () => {
  const a = { type: 'move', path: ['t1'] };
  expect(() => GameActionSchema.parse(a as any)).toThrow();
});

test('endTurn action passes', () => {
  const a = { type: 'endTurn' };
  expect(() => GameActionSchema.parse(a as any)).not.toThrow();
});
