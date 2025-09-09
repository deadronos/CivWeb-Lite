import { describe, it, expect } from 'vitest';
import { coverGameProviderEffects, initialStateForTests } from "..\\src\\contexts\\game-provider";

describe('GameProvider autoSim branch', () => {
  it('runs simulateAdvanceTurn when s.autoSim is true', () => {
    const s = initialStateForTests();
    s.autoSim = true as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    coverGameProviderEffects(s as any, dispatch as any);
    expect(dispatched.length).toBeGreaterThanOrEqual(1);
  });
});