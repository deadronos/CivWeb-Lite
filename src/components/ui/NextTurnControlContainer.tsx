import React from 'react';
import { useGame } from '../../hooks/useGame';
import NextTurnControl from './NextTurnControl';

export default function NextTurnControlContainer() {
  const { dispatch } = useGame();
  const onNextTurn = React.useCallback(() => dispatch({ type: 'END_TURN' }), [dispatch]);
  return <NextTurnControl onNextTurn={onNextTurn} />;
}

