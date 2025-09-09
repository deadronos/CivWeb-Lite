import { GameAction } from '../actions';
import { GameState, PlayerState, TechNode } from '../types';

function chooseNextTech(player: PlayerState, state: GameState): TechNode | undefined {
  // be defensive: tests may provide partial player shapes
  const leader = (player.leader as any) || { scienceFocus: 0, cultureFocus: 0 };
  const researched: string[] = Array.isArray((player as any).researchedTechIds) ? (player as any).researchedTechIds : [];
  const prefTree = leader.scienceFocus >= leader.cultureFocus ? 'science' : 'culture';
  const candidates = state.techCatalog.filter(t => {
    const prereqs: string[] = Array.isArray((t as any).prerequisites) ? (t as any).prerequisites : [];
    return (
      t.tree === prefTree &&
      !researched.includes(t.id) &&
      prereqs.every(p => researched.includes(p))
    );
  });
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
