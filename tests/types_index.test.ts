import { describe, it, expect } from 'vitest';
import { RUNTIME_TYPES_MARKER } from '../src/types';

describe('types index runtime', () => {
  it('exports marker', () => {
    expect(RUNTIME_TYPES_MARKER).toBe(true);
  });
});
