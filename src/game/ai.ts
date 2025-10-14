import type { GameState, PlayerState, TechNode, LeaderPersonality } from './types';
import type { GameAction, ProductionOrder } from './actions';
import { globalGameBus } from './events';
import { UNIT_TYPES, IMPROVEMENTS, BUILDINGS } from './content/registry';
import { UnitState } from '../types/unit';
import type { GameStateExtensionAlias as GameStateExtension, Hextile } from './content/types';
import { deterministicFloat, deterministicPick } from './utils/random';

// Basic AI decision weights (0-1 scale, tunable)
const AI_WEIGHTS = {
  science: 0.3, // Prioritize tech unlocks
  expansion: 0.4, // Queue settlers/units for growth
  military: 0.2, // Warriors/defense
  economy: 0.1, // Improvements for yields
} as const;

const HEX_DIRECTIONS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
] as const;

// Top-level estimated turns function
function getEstimatedTurns(type: ProductionOrder['type'], itemId: string): number {
  const baseCosts = { unit: 40, improvement: 20, building: 60 } as const;
  const baseYield = 1; // Assume basic city yield
  const raw = baseCosts[type] || 10;
  return Math.max(1, Math.ceil(raw / baseYield));
}

// Score a tech based on player personality and state
function scoreTech(player: PlayerState, tech: TechNode, state: GameState): number {
  const leader = player.leader as LeaderPersonality;
  const focus = tech.tree === 'science' ? leader.scienceFocus : leader.cultureFocus;
  const researched = new Set(player.researchedTechIds || []);
  const prereqsMet = (tech.prerequisites || []).every((p) => researched.has(p));
  if (!prereqsMet) {
    return 0;
  }

  // Prefer cheaper techs and those aligned with focus. Cost ranges ~20-60.
  const costWeight = Math.max(1, 80 - tech.cost);
  let score = costWeight * (1 + focus * 2);

  // Reward techs that unlock anything tangible.
  const unlockCount = tech.effects?.length ?? 0;
  score += unlockCount * 15;

  // Encourage early branching: slight bonus for first tech in a tree.
  if ((tech.prerequisites || []).length === 0) {
    score += 5;
  }

  // Bias by global weights to keep mix of science/culture progress.
  score *= tech.tree === 'science' ? 1 + AI_WEIGHTS.science * 0.5 : 1 + AI_WEIGHTS.economy * 0.5;

  return score;
}

// Generate research queue for AI (top 3 available techs)
function generateResearchQueue(player: PlayerState, state: GameState): string[] {
  const queueIds = player.researchQueue || [];
  const available = state.techCatalog.filter(
    (tech) =>
      !queueIds.includes(tech.id) &&
      !player.researchedTechIds?.includes(tech.id) &&
      player.researching?.techId !== tech.id
  );

  return available
    .map((tech) => ({ tech, score: scoreTech(player, tech, state) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ tech }) => tech.id);
}

// Basic production decision: Queue based on expansionism (e.g., settlers) or economy
function generateProductionQueue(
  player: PlayerState,
  cityId: string,
  _state: GameState,
  extension: GameStateExtension | undefined
): ProductionOrder[] {
  const leader = player.leader as LeaderPersonality;
  const queue: ProductionOrder[] = [];

  const availableUnits = new Set(extension?.playerState.availableUnits || Object.keys(UNIT_TYPES));
  const availableImprovements = new Set(
    extension?.playerState.availableImprovements || Object.keys(IMPROVEMENTS)
  );
  const researched = new Set(extension?.playerState.researchedTechs || []);
  const researchedCivics = new Set(extension?.playerState.researchedCivics || []);
  const city = extension?.cities[cityId];
  const built = new Set(city?.buildings || []);

  if (leader.expansionism > 0.6 && availableUnits.has('settler')) {
    queue.push({
      type: 'unit',
      item: 'settler',
      turnsRemaining: getEstimatedTurns('unit', 'settler'),
    });
  } else if (leader.expansionism > 0.3 && availableUnits.has('warrior')) {
    queue.push({
      type: 'unit',
      item: 'warrior',
      turnsRemaining: getEstimatedTurns('unit', 'warrior'),
    });
  }

  if (availableImprovements.has('farm')) {
    queue.push({
      type: 'improvement',
      item: 'farm',
      turnsRemaining: getEstimatedTurns('improvement', 'farm'),
    });
  }

  if (city) {
    const buildingCandidate = Object.values(BUILDINGS)
      .filter((def) => !built.has(def.id))
      .filter((def) => {
        if (!def.requires) return true;
        return researched.has(def.requires) || researchedCivics.has(def.requires);
      })
      .sort((a, b) => a.cost - b.cost)[0];
    if (buildingCandidate) {
      queue.push({
        type: 'building',
        item: buildingCandidate.id,
        turnsRemaining: getEstimatedTurns('building', buildingCandidate.id),
      });
    }
  }

  return queue;
}

function neighbourTiles(extension: GameStateExtension, origin: Hextile): Hextile[] {
  const tiles: Hextile[] = [];
  for (const delta of HEX_DIRECTIONS) {
    const id = `${origin.q + delta.q},${origin.r + delta.r}`;
    const tile = extension.tiles[id];
    if (tile) tiles.push(tile);
  }
  return tiles;
}

function isFriendlyOrEmpty(
  extension: GameStateExtension,
  tile: Hextile,
  playerId: string
): boolean {
  if (!tile.passable) return false;
  if (tile.occupantCityId) {
    const city = extension.cities[tile.occupantCityId];
    if (city && city.ownerId !== playerId) return false;
  }
  if (tile.occupantUnitId) {
    const unit = extension.units[tile.occupantUnitId];
    if (unit && unit.ownerId !== playerId) return false;
  }
  return true;
}

function chooseExplorationTarget(
  extension: GameStateExtension,
  unitTile: Hextile,
  playerId: string,
  baseSeed: string,
  unitId: string
): string | undefined {
  const neighbours = neighbourTiles(extension, unitTile)
    .filter((tile) => isFriendlyOrEmpty(extension, tile, playerId))
    .sort((a, b) => a.id.localeCompare(b.id));
  const target = deterministicPick(neighbours, [baseSeed, 'unit', unitId, unitTile.id]);
  return target?.id;
}

// Main AI turn decision function (called in reducer's AI phase)
export function generateAIDecisions(state: GameState, playerId: string): GameAction[] {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.isHuman) return [];

  const actions: GameAction[] = [];
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const startTime = now;
  const seedBase = `${state.seed}:${state.turn}:${playerId}`;

  const recommendedTechs = state.techCatalog
    .map((tech) => ({ tech, score: scoreTech(player, tech, state) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ tech }) => tech.id);

  if (!player.researching && recommendedTechs.length > 0) {
    const queuedAvailable = (player.researchQueue || []).find((id) =>
      recommendedTechs.includes(id)
    );
    const targetTechId = queuedAvailable ?? recommendedTechs[0];
    actions.push({
      type: 'SET_RESEARCH',
      playerId,
      payload: { techId: targetTechId },
    });
  }

  // Research planning: Update queue if empty or suboptimal
  const currentQueue = player.researchQueue || [];
  const replanRoll = deterministicFloat([seedBase, 'research', currentQueue.length]);
  if (currentQueue.length === 0 || replanRoll < 0.3) {
    const suggestedQueue = generateResearchQueue(player, state);
    for (const techId of suggestedQueue) {
      if (!currentQueue.includes(techId)) {
        actions.push({
          type: 'QUEUE_RESEARCH' as const,
          payload: { playerId, techId },
        });
      }
    }
  }

  // Production: For each city, suggest queue if empty
  if (state.contentExt) {
    const extension = state.contentExt;
    const cities = Object.values(extension.cities).filter(
      (city) => city.ownerId === playerId && city.productionQueue.length === 0
    );
    for (const city of cities) {
      const suggestions = generateProductionQueue(player, city.id, state, extension);
      for (const order of suggestions) {
        actions.push({
          type: 'CHOOSE_PRODUCTION_ITEM' as const,
          payload: { cityId: city.id, order },
        });
      }
    }
  }

  // Basic unit moves: e.g., idle warriors explore nearby (simplified without exploredBy)
  if (state.contentExt) {
    const extension = state.contentExt;
    const idleUnits = Object.values(extension.units)
      .filter(
        (unit) =>
          unit.ownerId === playerId &&
          unit.activeStates?.has(UnitState.Idle) &&
          unit.movementRemaining > 0
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    for (const unit of idleUnits.slice(0, 2)) {
      const locationId = typeof unit.location === 'string' ? unit.location : undefined;
      if (!locationId) continue;
      const originTile = extension.tiles[locationId];
      if (!originTile) continue;
      const targetId = chooseExplorationTarget(extension, originTile, playerId, seedBase, unit.id);
      if (targetId && targetId !== locationId) {
        actions.push({
          type: 'SET_UNIT_LOCATION' as const,
          payload: { unitId: unit.id, tileId: targetId },
        });
      }
    }
  }

  const duration =
    (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;
  actions.push({ type: 'RECORD_AI_PERF' as const, payload: { duration } });

  globalGameBus.emit('ai:decisions', { playerId, actions, duration });
  return actions;
}

// Export for benchmarks/scripts
export { AI_WEIGHTS, scoreTech, generateResearchQueue };
