import React from 'react';
import { useGame } from '../../hooks/use-game';
import NextTurnControl from './next-turn-control';

/**
 * @file This file contains the NextTurnControlContainer component, which is a container for the NextTurnControl component.
 */

/**
 * A container component for the NextTurnControl component.
 * It provides the `onNextTurn` callback to the NextTurnControl component.
 * @returns The rendered component.
 */
export default function NextTurnControlContainer() {
  const { dispatch } = useGame();
  const onNextTurn = React.useCallback(() => dispatch({ type: 'END_TURN' }), [dispatch]);
  return <NextTurnControl onNextTurn={onNextTurn} />;
}
