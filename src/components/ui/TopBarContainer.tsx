import React from 'react';
import { useGame } from '../../hooks/useGame';
import TopBar from './TopBar';

export default function TopBarContainer() {
  const { state } = useGame();
  const human = state.players.find(p => p.isHuman);
  const resources = React.useMemo(() => {
    if (!human) return {} as Record<string, number>;
    return {
      science: human.sciencePoints,
      culture: human.culturePoints,
    } as const;
  }, [human]);
  return <TopBar turn={state.turn} resources={resources} />;
}

