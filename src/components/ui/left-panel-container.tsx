import React from 'react';
import { useGame } from '../../hooks/use-game';
import LeftPanel from './left-panel';

/**
 * @file This file contains the LeftPanelContainer component, which is a container for the LeftPanel component.
 */

/**
 * A container component for the LeftPanel component.
 * It fetches the available technologies for the human player and passes them to the LeftPanel component.
 * @returns The rendered component.
 */
export default function LeftPanelContainer() {
  const { state, dispatch } = useGame();
  const human = state.players.find((p) => p.isHuman);

  const available = React.useMemo(() => {
    if (!human) return [] as Array<{ id: string; name: string; cost: number }>;
    return state.techCatalog
      .filter((t) => !human.researchedTechIds.includes(t.id))
      .filter((t) => t.prerequisites.every((p) => human.researchedTechIds.includes(p)))
      .slice(0, 6)
      .map((t) => ({ id: t.id, name: t.name, cost: t.cost }));
  }, [state.techCatalog, human]);

  const currentTechId = human?.researching?.techId;
  const onSelect = (techId: string) => {
    if (!human) return;
    dispatch({ type: 'SET_RESEARCH', playerId: human.id, payload: { techId } });
  };

  return <LeftPanel techs={available} currentTechId={currentTechId} onSelect={onSelect} />;
}
