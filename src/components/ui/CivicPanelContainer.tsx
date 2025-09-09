import React from 'react';
import { useGame } from '../../hooks/useGame';
import CivicPanel from './CivicPanel';

export default function CivicPanelContainer() {
  const { state, dispatch } = useGame();
  const ext = state.contentExt;
  const civics = ext?.civics ?? {};
  const researched = ext?.playerState.researchedCivics ?? [];

  const available = React.useMemo(() => {
    const list = Object.values(civics);
    return list
      .filter(c => !researched.includes(c.id))
      .filter(c => c.prerequisites.every(p => researched.includes(p)))
      .slice(0, 6)
      .map(c => ({ id: c.id, name: c.name, cost: c.cost }));
  }, [civics, researched]);

  const currentCivicId = ext?.playerState.cultureResearch?.civicId ?? null;
  const onSelect = (civicId: string) => {
    dispatch({ type: 'EXT_BEGIN_CULTURE_RESEARCH', payload: { civicId } });
  };

  if (!ext) return null;
  return <CivicPanel civics={available} currentCivicId={currentCivicId} onSelect={onSelect} />;
}

