import { describe, it, expect } from 'vitest';
import { generateAIDecisions } from '../src/game/ai';
import { GameState, PlayerState } from '../src/game/types';
import { UnitState, UnitCategory } from '../src/types/unit';
import { createEmptyState } from '../src/game/content/engine';
import { techCatalog } from '../src/game/tech/tech-catalog';

function createTestState(): { state: GameState; player: PlayerState } {
  const extension = createEmptyState();
  extension.tiles['0,0'] = {
    id: '0,0',
    q: 0,
    r: 0,
    biome: 'grassland',
    elevation: 0,
    features: [],
    improvements: [],
    occupantUnitId: 'u1',
    occupantCityId: 'c1',
    passable: true,
  } as any;
  extension.tiles['1,0'] = {
    id: '1,0',
    q: 1,
    r: 0,
    biome: 'grassland',
    elevation: 0,
    features: [],
    improvements: [],
    occupantUnitId: null,
    occupantCityId: null,
    passable: true,
  } as any;
  extension.tiles['0,1'] = {
    id: '0,1',
    q: 0,
    r: 1,
    biome: 'grassland',
    elevation: 0,
    features: [],
    improvements: [],
    occupantUnitId: null,
    occupantCityId: null,
    passable: false,
  } as any;

  extension.cities['c1'] = {
    id: 'c1',
    name: 'Capital',
    ownerId: 'P1',
    location: '0,0',
    population: 1,
    productionQueue: [],
    tilesWorked: ['0,0'],
    garrisonUnitIds: [],
    happiness: 0,
    buildings: [],
  } as any;

  extension.units['u1'] = {
    id: 'u1',
    type: 'warrior',
    category: UnitCategory.Melee,
    ownerId: 'P1',
    location: '0,0',
    hp: 100,
    movement: 2,
    movementRemaining: 2,
    attack: 6,
    defense: 4,
    sight: 2,
    activeStates: new Set([UnitState.Idle]),
    abilities: [],
  } as any;

  extension.playerState.researchedTechs = ['pottery'];
  extension.playerState.researchedCivics = ['code-of-laws'];

  const player: PlayerState = {
    id: 'P1',
    isHuman: false,
    leader: {
      id: 'leader-test',
      name: 'Test Leader',
      aggression: 0.3,
      scienceFocus: 0.8,
      cultureFocus: 0.4,
      expansionism: 0.5,
    },
    sciencePoints: 5,
    culturePoints: 5,
    researchedTechIds: [],
    researching: null,
    researchQueue: [],
  };

  const state: GameState = {
    schemaVersion: 1,
    seed: 'ai-deterministic-seed',
    turn: 3,
    map: { width: 3, height: 3, tiles: [] },
    players: [player],
    techCatalog,
    rngState: undefined,
    log: [],
    mode: 'standard',
    autoSim: false,
    ui: { openPanels: {} },
    contentExt: extension,
  };

  return { state, player };
}

describe('generateAIDecisions', () => {
  it('creates deterministic research, production, and movement plans', () => {
    const { state, player } = createTestState();
    const before = structuredClone(state);
    const actions = generateAIDecisions(state, player.id);
    expect(state).toEqual(before);

    // Actions should be stable when evaluated again with the same snapshot
    const actionsSecond = generateAIDecisions(before, player.id);
    const sanitize = (list: ReturnType<typeof generateAIDecisions>) =>
      list
        .filter((action) => action.type !== 'RECORD_AI_PERF')
        .map((action) => ({ type: action.type, payload: action.payload }));
    expect(sanitize(actionsSecond)).toEqual(sanitize(actions));

    expect(actions.some((action) => action.type === 'SET_RESEARCH')).toBe(true);
    expect(actions.some((action) => action.type === 'QUEUE_RESEARCH')).toBe(true);
    expect(actions.some((action) => action.type === 'CHOOSE_PRODUCTION_ITEM')).toBe(true);

    const moveAction = actions.find((action) => action.type === 'SET_UNIT_LOCATION');
    expect(moveAction).toBeDefined();
    expect(moveAction?.payload.tileId).toBe('1,0');

    const perfAction = actions.at(-1);
    expect(perfAction?.type).toBe('RECORD_AI_PERF');
  });
});
