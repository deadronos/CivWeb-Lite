import { it } from 'vitest';
import * as actionSchemas from '../schema/action.schema';
import { GAME_ACTION_TYPES } from '../src/game/actions';

function extractLiteralsFromSchema(node: any): string[] {
  if (!node || typeof node !== 'object') return [];
  const options = node._def && node._def.options;
  if (Array.isArray(options)) {
    const out: string[] = [];
    for (const opt of options) out.push(...extractLiteralsFromSchema(opt));
    return out;
  }
  const shape = node._def && (typeof node._def.shape === 'function' ? node._def.shape() : node._def.shape);
  if (shape && shape.type && shape.type._def) {
    const value = shape.type._def.value;
    if (typeof value === 'string') return [value];
  }
  return [];
}

it('debug action schema sync', () => {
  const exportedLiterals = new Set<string>();
  for (const [name, exported] of Object.entries(actionSchemas)) {
    const lits = extractLiteralsFromSchema(exported as any);
    for (const l of lits) exportedLiterals.add(l);
  }
  const exportedUpper = [...exportedLiterals].filter((t) => /^[\dA-Z_]+$/.test(t)).toSorted();
  const canonicalUpper = [...(GAME_ACTION_TYPES as readonly string[])].slice().toSorted();

  // Print for debugging while investigating test sync mismatch
  console.log('exportedUpper', exportedUpper);
  console.log('canonicalUpper', canonicalUpper);
});
