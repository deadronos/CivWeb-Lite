import React from 'react';
import { useGame } from '../../hooks/useGame';
import LeftPanel from './LeftPanel';

export default function ExtTechPanelContainer() {
  const { state, dispatch } = useGame();
  const ext = state.contentExt;
  const researched = ext?.playerState.researchedTechs ?? [];

  const available = React.useMemo(() => {
    const list = Object.values(ext?.techs ?? {});
    return list
      .filter((t) => !researched.includes(t.id))
      .filter((t) => t.prerequisites.every((p) => researched.includes(p)))
      .slice(0, 6)
      .map((t) => ({ id: t.id, name: t.name, cost: t.cost }));
  }, [ext?.techs, researched]);

  const currentTechId = ext?.playerState.research?.techId ?? null;
  const onSelect = (techId: string) => {
    dispatch({ type: 'EXT_BEGIN_RESEARCH', payload: { techId } });
  };

  if (!ext) return null;
  return <LeftPanel techs={available} currentTechId={currentTechId} onSelect={onSelect} />;
}
