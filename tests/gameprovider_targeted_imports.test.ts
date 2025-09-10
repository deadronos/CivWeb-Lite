test('simulateAdvanceTurn calls globalGameBus.emit and dispatches END_TURN', async () => {
  vi.resetModules();
  // mock globalGameBus and evaluateAI
  const emitMock = vi.fn();
  vi.doMock('../src/game/events', () => ({ globalGameBus: { emit: emitMock } }));
  vi.doMock('../src/game/ai/ai', () => ({
    evaluateAI: () => [{ type: 'LOG', payload: 'ai-act' }],
  }));

  const gp = await import('../src/contexts/game-provider');
  const _s = gp.initialStateForTests();
  // add one AI player
  _s.players = [
    {
      id: 'ai1',
      isHuman: false,
      leader: { id: 'L1', name: 'AI' },
      researchedTechIds: [],
      researching: null,
      sciencePoints: 0,
      culturePoints: 0,
    },
  ];
  const actions: any[] = [];
  const dispatch = (a: any) => actions.push(a);
  gp.simulateAdvanceTurn(_s, dispatch);
  // globalGameBus.emit should have been called and END_TURN dispatched
  expect(emitMock).toHaveBeenCalled();
  expect(actions.some((a) => a.type === 'END_TURN')).toBe(true);
});
