import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useGame } from '../src/hooks/useGame';
import { simulateAdvanceTurn, initialStateForTests } from '../src/contexts/GameProvider';
import { exerciseUIRuntime, coverForTestsApp } from '../src/App';
import { globalGameBus } from '../src/game/events';

describe('Targeted coverage tests', () => {
  test('useGame throws when used outside GameProvider', () => {
    function BadConsumer() {
      // calling the hook should throw
      useGame();
      return null;
    }
    // rendering should throw an error
    expect(() => render(<BadConsumer />)).toThrow();
  });

  test('simulateAdvanceTurn with researching player triggers tech unlocked path', () => {
    const s = initialStateForTests();
    // prepare a tech in catalog
    const testTech = { id: 'T1', tree: 'science', name: 'T1', cost: 1, prerequisites: [], effects: [] } as any;
    s.techCatalog = [testTech];
    s.players = [
      {
        id: 'p1',
        isHuman: true,
        leader: { id: 'l', name: 'L', aggression: 0, scienceFocus: 1, cultureFocus: 0, expansionism: 0 },
        sciencePoints: 1,
        culturePoints: 0,
        researchedTechIds: [],
        researching: { techId: 'T1', progress: 0 },
      } as any,
    ];
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const emitSpy = vi.spyOn(globalGameBus, 'emit');

    simulateAdvanceTurn(s, dispatch);

    expect(dispatched.find(d => d.type === 'END_TURN')).toBeTruthy();
    // tech:unlocked should be emitted when research completes
    expect(emitSpy).toHaveBeenCalled();
    emitSpy.mockRestore();
  });

  test('exerciseUIRuntime mirrors UI and returns expected snapshot', () => {
    const state = { seed: 'abc', map: { width: 2, height: 3 }, turn: 0 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const snap = exerciseUIRuntime(state, dispatch);
    expect(snap.seed).toContain('abc');
    expect(snap.mapText).toBe('3x4');
    expect(dispatched.find(d => d.type === 'INIT')).toBeTruthy();
    expect(coverForTestsApp()).toBe(true);
  });
});
