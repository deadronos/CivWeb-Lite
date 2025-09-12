import React from 'react';
import { useGame } from '../../hooks/use-game';
import LeftPanel from './left-panel';

/**
 * @file This file contains the ExtensionTechPanelContainer component, which is a container for the LeftPanel component.
 */

/**
 * A container component for the LeftPanel component.
 * It fetches the available technologies from the game state extension and passes them to the LeftPanel component.
 * @returns The rendered component, or null if the game state extension is not available.
 */
export default function ExtensionTechPanelContainer() {
  const { state, dispatch } = useGame();
  const extension = state.contentExt;
  const researched = extension?.playerState.researchedTechs ?? [];

  const available = React.useMemo(() => {
    const list = Object.values(extension?.techs ?? {});
    return list
      .filter((t) => !researched.includes(t.id))
      .filter((t) => t.prerequisites.every((p) => researched.includes(p)))
      .slice(0, 6)
      .map((t) => ({ id: t.id, name: t.name, cost: t.cost }));
  }, [extension?.techs, researched]);

  const currentTechId = extension?.playerState.research?.techId;
  const onSelect = (techId: string) => {
    dispatch({ type: 'EXT_BEGIN_RESEARCH', payload: { techId } });
  };
  if (!extension) return;
  return <LeftPanel techs={available} currentTechId={currentTechId} onSelect={onSelect} />;
}
