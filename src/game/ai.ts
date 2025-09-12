import type { GameState, PlayerState, TechNode, LeaderPersonality } from './types';
import type { GameAction, ProductionOrder } from './actions';
import { globalGameBus } from './events';
import { UNIT_TYPES, IMPROVEMENTS, BUILDINGS } from './content/registry';
import { UnitState } from '../types/unit';

// Basic AI decision weights (0-1 scale, tunable)
const AI_WEIGHTS = {
  science: 0.3, // Prioritize tech unlocks
  expansion: 0.4, // Queue settlers/units for growth
  military: 0.2, // Warriors/defense
  economy: 0.1, // Improvements for yields
} as const;

// Top-level estimated turns function
function getEstimatedTurns(type: ProductionOrder['type'], itemId: string): number {
  const baseCosts = { unit: 40, improvement: 20, building: 60 } as const;
  const baseYield = 1; // Assume basic city yield
  return Math.ceil((baseCosts[type] || 10) / baseYield);
}

// Score a tech based on player personality and state
function scoreTech(player: PlayerState, tech: TechNode, state: GameState): number {
  const leader = player.leader as LeaderPersonality;
  let score = 0;

  // Base on science focus
  score += leader.scienceFocus * (tech.cost / 50); // Normalize cost (lower cost = higher score)

  // Bonus for unlocks (heuristic: units/improvements value)
  const unlocksValue = tech.effects?.length || 0;
  score += unlocksValue * 10;

  // Expansionist bonus for movement/science unlocks
  if (tech.effects?.some(effect => effect.includes('movement') || effect.includes('expansion'))) {
    score += leader.expansionism * 20;
  }

  // Penalty if prereqs not met (should be filtered out)
  if ((tech.prerequisites || []).some(p => !player.researchedTechIds?.includes(p))) {
    score *= 0.1;
  }

  return score;
}

// Generate research queue for AI (top 3 available techs)
function generateResearchQueue(player: PlayerState, state: GameState): string[] {
  const available = state.techCatalog.filter(tech => 
    !player.researchedTechIds?.includes(tech.id) &&
    player.researching?.techId !== tech.id &&
    !(player.researchQueue || []).includes(tech.id) &&
    (tech.prerequisites || []).every(pr => player.researchedTechIds?.includes(pr) ?? false)
  );

  return available
    .map(tech => ({ tech, score: scoreTech(player, tech, state) }))
    .toSorted((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ tech }) => tech.id);
}

// Basic production decision: Queue based on expansionism (e.g., settlers) or economy
function generateProductionQueue(player: PlayerState, cityId: string, state: GameState): ProductionOrder[] {
  const leader = player.leader as LeaderPersonality;
  const queue: ProductionOrder[] = [];

  if (leader.expansionism > 0.6) {
    // High expansion: Queue settler
    queue.push({ type: 'unit', item: 'settler', turnsRemaining: getEstimatedTurns('unit', 'settler') });
  } else if (leader.expansionism > 0.3) {
    // Medium: Warrior for defense
    queue.push({ type: 'unit', item: 'warrior', turnsRemaining: getEstimatedTurns('unit', 'warrior') });
  }

  // Always queue a basic improvement for economy
  queue.push({ type: 'improvement', item: 'farm', turnsRemaining: getEstimatedTurns('improvement', 'farm') });

  return queue;
}

// Main AI turn decision function (called in reducer's AI phase)
export function generateAIDecisions(state: GameState, playerId: string): GameAction[] {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.isHuman) return [];

  const actions: GameAction[] = [];
  const startTime = performance.now();

  // Research planning: Update queue if empty or suboptimal
  const currentQueue = player.researchQueue || [];
  if (currentQueue.length === 0 || Math.random() < 0.3) { // 30% chance to replan
    const suggestedQueue = generateResearchQueue(player, state);
    for (const techId of suggestedQueue) {
      if (!currentQueue.includes(techId)) {
        actions.push({
          type: 'QUEUE_RESEARCH' as const,
          payload: { playerId, techId }
        });
      }
    }
  }

  // Production: For each city, suggest queue if empty
  if (state.contentExt) {
    const cities = Object.values(state.contentExt.cities)
      .filter(city => city.ownerId === playerId && city.productionQueue.length === 0);
    for (const city of cities) {
      const suggestions = generateProductionQueue(player, city.id, state);
      for (const order of suggestions) {
        actions.push({
          type: 'CHOOSE_PRODUCTION_ITEM' as const,
          payload: { cityId: city.id, order }
        });
      }
    }
  }

  // Basic unit moves: e.g., idle warriors explore nearby (simplified without exploredBy)
  if (state.contentExt) {
    const idleUnits = Object.values(state.contentExt.units)
      .filter(
        unit =>
          unit.ownerId === playerId &&
          unit.activeStates?.has(UnitState.Idle) &&
          unit.movementRemaining > 0
      );
    for (const unit of idleUnits.slice(0, 2)) { // Limit to 2 units per turn for performance
      // Simple: Set to a random passable tile (placeholder; no real exploration tracking)
      const passableTiles = Object.values(state.contentExt!.tiles).filter(t => t.passable);
      if (passableTiles.length > 0) {
        const target = passableTiles[Math.floor(Math.random() * passableTiles.length)];
        actions.push({
          type: 'SET_UNIT_LOCATION' as const,
          payload: { unitId: unit.id, tileId: target.id }
        });
      }
    }
  }

  const duration = performance.now() - startTime;
  actions.push({ type: 'RECORD_AI_PERF' as const, payload: { duration } });

  globalGameBus.emit('ai:decisions', { playerId, actions, duration });
  return actions;
}

// Export for benchmarks/scripts
export { AI_WEIGHTS, scoreTech, generateResearchQueue };
