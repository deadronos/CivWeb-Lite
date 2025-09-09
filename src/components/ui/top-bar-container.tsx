import React from 'react';
import { useGame } from "..\\..\\hooks\\use-game";
import TopBar from "./top-bar";

export default function TopBarContainer() {
  const { state } = useGame();
  const human = state.players.find((p) => p.isHuman);
  const resources = React.useMemo(() => {
    return {
      science: human?.sciencePoints ?? 0,
      culture: human?.culturePoints ?? 0
    } as const;
  }, [human]);
  const onOpenLoad = () => globalThis.dispatchEvent(new Event('hud:openLoad'));
  const onOpenLoadPaste = () => globalThis.dispatchEvent(new Event('hud:openLoad:paste'));
  return (
    <TopBar
      turn={state.turn}
      resources={resources}
      onOpenLoad={onOpenLoad}
      onOpenLoadPaste={onOpenLoadPaste} />);


}