import { GameAction } from '../actions';
import { GameState, PlayerState, TechNode } from '../types';

function chooseNextTech(player: PlayerState, state: GameState): TechNode | undefined {
  const prefTree =
    player.leader.scienceFocus >= player.leader.cultureFocus ? 'science' : 'culture';
  const candidates = state.techCatalog.filter(t =>
    t.tree === prefTree &&
    !player.researchedTechIds.includes(t.id) &&
    t.prerequisites.every(p => player.researchedTechIds.includes(p))
  );
  return candidates[0];
}

export function evaluateAI(player: PlayerState, state: GameState): GameAction[] {
  const actions: GameAction[] = [];
  if (!player.researching) {
    const tech = chooseNextTech(player, state);
    if (tech) {
      actions.push({ type: 'SET_RESEARCH', playerId: player.id, payload: { techId: tech.id } });
    }
  }
  return actions;
}
