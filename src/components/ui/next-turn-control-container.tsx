import React from 'react';
import { useGame } from "..\\..\\hooks\\use-game";
import NextTurnControl from './next-turn-control';

export default function NextTurnControlContainer() {
  const { dispatch } = useGame();
  const onNextTurn = React.useCallback(() => dispatch({ type: 'END_TURN' }), [dispatch]);
  return <NextTurnControl onNextTurn={onNextTurn} />;
}