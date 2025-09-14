import { describe, it, expect } from 'vitest';
import * as actionSchemas from '../schema/action.schema';
import { GAME_ACTION_TYPES } from '../src/game/actions';

// Try to robustly extract `type` literal(s) from exported Zod schemas.
function extractLiteralsFromSchema(node: any): string[] {
  if (!node || typeof node !== 'object') return [];

  // If it's a discriminated union (ZodUnion / ZodDiscriminatedUnion)
  const options = node._def && node._def.options;
  if (Array.isArray(options)) {
    const out: string[] = [];
    for (const opt of options) {
      out.push(...extractLiteralsFromSchema(opt));
    }
    return out;
  }

  // If it's a ZodObject-like with a shape that includes a `type: z.literal('X')`
  const shape = node._def && (typeof node._def.shape === 'function' ? node._def.shape() : node._def.shape);
  if (shape && shape.type && shape.type._def) {
    // literal value sits on shape.type._def.value for z.literal
    const value = shape.type._def.value;
    if (typeof value === 'string') return [value];
  }

  return [];
}

describe('action schema vs GAME_ACTION_TYPES sync', () => {
  it('GAME_ACTION_TYPES and exported uppercase Zod schemas must match 1:1', () => {
    const exportedLiterals = new Set<string>();

    for (const [name, exported] of Object.entries(actionSchemas)) {
      const lits = extractLiteralsFromSchema(exported);
      for (const l of lits) exportedLiterals.add(l);
    }

    // Only consider canonical uppercase action types for strict sync. Many schemas in
    // this file use lower-case names (e.g. 'move', 'attack') and are intentionally
    // separate from the engine's canonical uppercase discriminators.
  const exportedUpper = [...exportedLiterals].filter((t) => /^[\dA-Z_]+$/.test(t)).toSorted();
  const canonicalUpper = [...(GAME_ACTION_TYPES as readonly string[])].toSorted();

    const extras = exportedUpper.filter((t) => !canonicalUpper.includes(t));
    const missing = canonicalUpper.filter((t) => !exportedUpper.includes(t));

  const debugMessage = `exportedUpper=${JSON.stringify(exportedUpper)} canonicalUpper=${JSON.stringify(canonicalUpper)}`;

  expect(extras, `Zod schemas contain uppercase action types not present in GAME_ACTION_TYPES: ${extras.join(', ')} | ${debugMessage}`).toEqual([]);
  expect(missing, `GAME_ACTION_TYPES missing strict uppercase Zod schemas for: ${missing.join(', ')} | ${debugMessage}`).toEqual([]);
  });
});
