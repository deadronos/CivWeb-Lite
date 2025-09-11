import React from 'react';
import { useGame } from "../../hooks/use-game";
import CivicPanel from './civic-panel';

export default function CivicPanelContainer() {
  const { state, dispatch } = useGame();
  const extension = state.contentExt;
  const civics = extension?.civics ?? {};
  const researched = extension?.playerState.researchedCivics ?? [];

  const available = React.useMemo(() => {
    // civics is an index of Civic definitions; narrow to an array for mapping
    const list = Object.values(civics) as any[];
    return list
      .filter((c) => !researched.includes(c.id))
      .filter((c) => c.prerequisites.every((p: any) => researched.includes(p)))
      .slice(0, 6)
      .map((c) => ({ id: c.id, name: c.name, cost: c.cost }));
  }, [civics, researched]);

  const currentCivicId = extension?.playerState.cultureResearch?.civicId;
  const onSelect = (civicId: string) => {
    dispatch({ type: 'EXT_BEGIN_CULTURE_RESEARCH', payload: { civicId } });
  };

  if (!extension) return;
  return <CivicPanel civics={available} currentCivicId={currentCivicId} onSelect={onSelect} />;
}