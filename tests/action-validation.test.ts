import { expect, test } from 'vitest';
import { GameActionSchema, AnyActionSchema } from '../schema/action.schema';

test('valid move action passes schema', () => {
  const move = { type: 'move', unitId: 'u1', path: ['t1', 't2'] };
  expect(() => GameActionSchema.parse(move)).not.toThrow();
});

test('invalid move action fails schema', () => {
  const a = { type: 'move', path: ['t1'] };
  expect(() => GameActionSchema.parse(a as any)).toThrow();
});

test('endTurn action passes', () => {
  const a = { type: 'endTurn' };
  expect(() => GameActionSchema.parse(a as any)).not.toThrow();
});

test('log event accepted by permissive schema and included in GameActionSchema', () => {
  const log = { type: 'LOG_EVENT', payload: { entry: { timestamp: Date.now(), type: 'turn:start' } } };
  expect(() => AnyActionSchema.parse(log)).not.toThrow();
  expect(() => GameActionSchema.parse(log)).not.toThrow();
});

test('reorder production queue action passes schema', () => {
  const a = {
    type: 'REORDER_PRODUCTION_QUEUE',
    payload: {
      cityId: 'c1',
      reorderedQueue: [
        { type: 'unit', item: 'warrior' },
        { type: 'building', item: 'granary', turns: 3 },
      ],
    },
  };
  expect(() => GameActionSchema.parse(a as any)).not.toThrow();
});

test('cancel production order action passes schema', () => {
  const a = {
    type: 'CANCEL_PRODUCTION_ORDER',
    payload: { cityId: 'c1', orderIndex: 0 },
  };
  expect(() => GameActionSchema.parse(a as any)).not.toThrow();
});

test('switch research policy action passes schema', () => {
  const a = {
    type: 'SWITCH_RESEARCH_POLICY',
    payload: { playerId: 'p1', policy: 'discardProgress' },
  };
  expect(() => GameActionSchema.parse(a as any)).not.toThrow();
});

test('ISSUE_MOVE with confirmCombat passes schema', () => {
  const a = {
    type: 'ISSUE_MOVE',
    payload: { unitId: 'u1', path: ['t1', 't2'], confirmCombat: true },
  };
  expect(() => GameActionSchema.parse(a as any)).not.toThrow();
});

