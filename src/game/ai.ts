import type { GameState, PlayerState, TechNode, LeaderPersonality, GameAction } from './types';
import { globalGameBus } from './events';
import { UNIT_TYPES, IMPROVEMENTS, BUILDINGS } from './content/registry';

// Basic AI decision weights (0-1 scale, tunable)
const AI_WEIGHTS = {
  science: 0.3, // Prioritize tech unlocks
  expansion: 0.4, // Queue settlers/units for growth
  military: 0.2, // Warriors/defense
  economy: 0.1, // Improvements for yields
} as const;

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
  if (tech.effects?.some(e => e.includes('movement') || e.includes('expansion'))) {
    score += leader.expansionism * 20;
  }

  // Penalty if prereqs not met (should be filtered out)
  if (tech.prerequisites.some(p => !player.researchedTechIds.includes(p))) {
    score *= 0.1;
  }

  return score;
}

// Generate research queue for AI (top 3 available techs)
function generateResearchQueue(player: PlayerState, state: GameState): string[] {
  const available = state.techCatalog.filter(tech => 
    !player.researchedTechIds.includes(tech.id) &&
    !player.researching?.techId === tech.id &&
    ! (player.researchQueue || []).includes(tech.id) &&
    tech.prerequisites.every(pr => player.researchedTechIds.includes(pr))
  );

  return available
    .map(tech => ({ tech, score: scoreTech(player, tech, state) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ tech }) => tech.id);
}

// Basic production decision: Queue based on expansionism (e.g., settlers) or economy
function generateProductionQueue(player: PlayerState, cityId: string, state: GameState): { type: string; itemId: string }[] {
  const leader = player.leader as LeaderPersonality;
  const queue: { type: string; itemId: string }[] = [];

  if (leader.expansionism > 0.6) {
    // High expansion: Queue settler
    queue.push({ type: 'unit', itemId: 'settler' });
  } else if (leader.expansionism > 0.3) {
    // Medium: Warrior for defense
    queue.push({ type: 'unit', itemId: 'warrior' });
  }

  // Always queue a basic improvement for economy
  queue.push({ type: 'improvement', itemId: 'farm' });

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
    suggestedQueue.forEach(techId => {
      if (!currentQueue.includes(techId)) {
        actions.push({
          type: 'QUEUE_RESEARCH',
          payload: { playerId, techId }
        });
      }
    });
  }

  // Production: For each city, suggest queue if empty
  if (state.contentExt) {
    Object.values(state.contentExt.cities)
      .filter(city => city.ownerId === playerId && city.productionQueue.length === 0)
      .forEach(city => {
        const suggestions = generateProductionQueue(player, city.id, state);
        suggestions.forEach(order => {
          actions.push({
            type: 'CHOOSE_PRODUCTION_ITEM',
            payload: { cityId: city.id, order }
          });
        });
      });
  }

  // Basic unit moves: e.g., idle warriors explore nearby
  if (state.contentExt) {
    Object.values(state.contentExt.units)
      .filter(unit => unit.ownerId === playerId && unit.state === 'idle' && unit.movementRemaining > 0)
      .forEach(unit => {
        // Simple: Move to nearest unexplored tile (placeholder logic)
        const unexplored = Object.values(state.contentExt!.tiles).find(t => 
          !playerId.includes(t.exploredBy || []) && // Assuming exploredBy array
          t.passable
        );
        if (unexplored) {
          actions.push({
            type: 'ISSUE_MOVE',
            payload: { unitId: unit.id, path: [unexplored.id], confirmCombat: false }
          });
        }
      });
  }

  const duration = performance.now() - startTime;
  actions.push({ type: 'RECORD_AI_PERF', payload: { duration } });

  globalGameBus.emit('ai:decisions', { playerId, actions, duration });
  return actions;
}

// Export for benchmarks/scripts
export { AI_WEIGHTS, scoreTech, generateResearchQueue };
