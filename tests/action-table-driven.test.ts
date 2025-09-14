import { describe, test, expect } from 'vitest';
import {
  ChooseProductionItemActionSchema,
  QueueResearchActionSchema,
  ExtFoundCityActionSchema as ExtensionFoundCityActionSchema,
  SetUnitLocationActionSchema,
  ReorderProductionQueueActionSchema,
} from '../schema/action.schema';

// Note: ProductionOrderSchema is not exported in the original file; recreate a small compatible shape here if missing
// We'll attempt to import it; if it's not exported this test will still run because schemas are structurally validated below via parse.

describe('table-driven action payload validation', () => {
  const cases = [
    {
      name: 'CHOOSE_PRODUCTION_ITEM - valid',
      schema: ChooseProductionItemActionSchema,
      value: { type: 'CHOOSE_PRODUCTION_ITEM', payload: { cityId: 'c1', order: { type: 'unit', item: 'settler' } } },
      shouldPass: true,
    },
    {
      name: 'CHOOSE_PRODUCTION_ITEM - invalid missing order',
      schema: ChooseProductionItemActionSchema,
      value: { type: 'CHOOSE_PRODUCTION_ITEM', payload: { cityId: 'c1' } },
      shouldPass: false,
    },
    {
      name: 'QUEUE_RESEARCH - valid',
      schema: QueueResearchActionSchema,
      value: { type: 'QUEUE_RESEARCH', payload: { playerId: 'p1', techId: 'agriculture' } },
      shouldPass: true,
    },
    {
      name: 'QUEUE_RESEARCH - invalid missing techId',
      schema: QueueResearchActionSchema,
      value: { type: 'QUEUE_RESEARCH', payload: { playerId: 'p1' } },
      shouldPass: false,
    },
    {
      name: 'EXT_FOUND_CITY - valid',
      schema: ExtensionFoundCityActionSchema,
      value: { type: 'EXT_FOUND_CITY', payload: { unitId: 'u1', tileId: 't9', name: 'NewTown' } },
      shouldPass: true,
    },
    {
      name: 'EXT_FOUND_CITY - invalid missing unitId',
      schema: ExtensionFoundCityActionSchema,
      value: { type: 'EXT_FOUND_CITY', payload: { tileId: 't9' } },
      shouldPass: false,
    },
    {
      name: 'SET_UNIT_LOCATION - valid',
      schema: SetUnitLocationActionSchema,
      value: { type: 'SET_UNIT_LOCATION', payload: { unitId: 'u5', tileId: 't5' } },
      shouldPass: true,
    },
    {
      name: 'SET_UNIT_LOCATION - invalid missing tileId',
      schema: SetUnitLocationActionSchema,
      value: { type: 'SET_UNIT_LOCATION', payload: { unitId: 'u5' } },
      shouldPass: false,
    },
    {
      name: 'REORDER_PRODUCTION_QUEUE - valid',
      schema: ReorderProductionQueueActionSchema,
      value: {
        type: 'REORDER_PRODUCTION_QUEUE',
        payload: { cityId: 'c1', reorderedQueue: [{ type: 'unit', item: 'settler' }] },
      },
      shouldPass: true,
    },
    {
      name: 'REORDER_PRODUCTION_QUEUE - invalid missing cityId',
      schema: ReorderProductionQueueActionSchema,
      value: { type: 'REORDER_PRODUCTION_QUEUE', payload: { reorderedQueue: [] } },
      shouldPass: false,
    },
  ];

  for (const c of cases) {
    test(c.name, () => {
      if (c.shouldPass) {
        expect(() => c.schema.parse(c.value)).not.toThrow();
      } else {
        expect(() => c.schema.parse(c.value)).toThrow();
      }
    });
  }
});
