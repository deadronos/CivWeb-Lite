import React from 'react';
import { useGame } from "..\\..\\hooks\\use-game";
import LeftPanel from "./left-panel";

export default function ExtensionTechPanelContainer() {
  const { state, dispatch } = useGame();
  const extension = state.contentExt;
  const researched = extension?.playerState.researchedTechs ?? [];

  const available = React.useMemo(() => {
    const list = Object.values(extension?.techs ?? {});
    return list.
    filter((t) => !researched.includes(t.id)).
    filter((t) => t.prerequisites.every((p) => researched.includes(p))).
    slice(0, 6).
    map((t) => ({ id: t.id, name: t.name, cost: t.cost }));
  }, [extension?.techs, researched]);

  const currentTechId = extension?.playerState.research?.techId ?? null;
  const onSelect = (techId: string) => {
    dispatch({ type: 'EXT_BEGIN_RESEARCH', payload: { techId } });
  };

  if (!extension) return null;
  return <LeftPanel techs={available} currentTechId={currentTechId} onSelect={onSelect} />;
}