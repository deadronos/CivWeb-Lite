import React from 'react';
import { useGame } from '../../hooks/useGame';
import TopBar from './TopBar';

export default function TopBarContainer() {
  const { state } = useGame();
  const human = state.players.find(p => p.isHuman);
  const resources = React.useMemo(() => {
    return {
      science: human?.sciencePoints ?? 0,
      culture: human?.culturePoints ?? 0,
    } as const;
  }, [human]);
  const onOpenLoad = () => window.dispatchEvent(new Event('hud:openLoad'));
  const onOpenLoadPaste = () => window.dispatchEvent(new Event('hud:openLoad:paste'));
  return <TopBar turn={state.turn} resources={resources} onOpenLoad={onOpenLoad} onOpenLoadPaste={onOpenLoadPaste} />;
}
