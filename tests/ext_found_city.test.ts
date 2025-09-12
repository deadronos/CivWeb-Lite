import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from '../src/test-utils/game-provider';

describe('EXT_FOUND_CITY', () => {
  it('creates a city from a settler and removes the settler', () => {
    let s = initialStateForTests();
    // create tile and settler
    s = applyAction(s, { type: 'EXT_ADD_TILE', payload: { tile: { id: 't1', q: 0, r: 0, biome: 'grassland' } } } as any);
    s = applyAction(s, { type: 'EXT_ADD_UNIT', payload: { unitId: 'u_sett', type: 'settler', ownerId: 'P1', tileId: 't1' } } as any);
    // pre-check
    expect(s.contentExt).toBeDefined();
    expect(s.contentExt!.tiles['t1']).toBeDefined();
    expect(s.contentExt!.units['u_sett']).toBeDefined();

    // Found city
    s = applyAction(s, { type: 'EXT_FOUND_CITY', payload: { unitId: 'u_sett' } } as any);

    // city should exist at t1 and owner match
    const cities = Object.values(s.contentExt!.cities);
    expect(cities.length).toBeGreaterThanOrEqual(1);
    const city = cities.find((c) => c.location === 't1' && c.ownerId === 'P1');
    expect(city).toBeDefined();

    // settler removed
    expect(s.contentExt!.units['u_sett']).toBeUndefined();
    // tile updated
    expect(s.contentExt!.tiles['t1'].occupantCityId).toBeDefined();
  });

  it('rejects founding with a non-settler unit (warrior)', () => {
    let s = initialStateForTests();
    s = applyAction(s, { type: 'EXT_ADD_TILE', payload: { tile: { id: 't2', q: 1, r: 0, biome: 'grassland' } } } as any);
    s = applyAction(s, { type: 'EXT_ADD_UNIT', payload: { unitId: 'u_w', type: 'warrior', ownerId: 'P1', tileId: 't2' } } as any);

    const beforeCities = Object.keys(s.contentExt!.cities).length;
    s = applyAction(s, { type: 'EXT_FOUND_CITY', payload: { unitId: 'u_w' } } as any);
    const afterCities = Object.keys(s.contentExt!.cities).length;
    // no new city created
    expect(afterCities).toBe(beforeCities);
    // warrior still exists
    expect(s.contentExt!.units['u_w']).toBeDefined();
  });

  it('rejects founding on an occupied tile', () => {
    let s = initialStateForTests();
    s = applyAction(s, { type: 'EXT_ADD_TILE', payload: { tile: { id: 't3', q: 2, r: 0, biome: 'grassland' } } } as any);
    // existing city
    s = applyAction(s, { type: 'EXT_ADD_CITY', payload: { cityId: 'city_existing', name: 'X', ownerId: 'P1', tileId: 't3' } } as any);
    s = applyAction(s, { type: 'EXT_ADD_UNIT', payload: { unitId: 'u_sett2', type: 'settler', ownerId: 'P2', tileId: 't3' } } as any);

    const beforeCities = Object.keys(s.contentExt!.cities).length;
    s = applyAction(s, { type: 'EXT_FOUND_CITY', payload: { unitId: 'u_sett2' } } as any);
    const afterCities = Object.keys(s.contentExt!.cities).length;
    // cities unchanged
    expect(afterCities).toBe(beforeCities);
    // settler still present (action rejected)
    expect(s.contentExt!.units['u_sett2']).toBeDefined();
  });
});
