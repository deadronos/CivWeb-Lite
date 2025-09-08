import { useContext } from 'react';
import { GameStateContext, GameDispatchContext, Dispatch } from '../contexts/GameProvider';
import { GameState } from '../game/types';

export function useGame(): { state: Readonly<GameState>; dispatch: Dispatch } {
  const state = useContext(GameStateContext);
  const dispatch = useContext(GameDispatchContext);
  if (!state || !dispatch) {
    throw new Error('useGame must be used within GameProvider');
  }
  return { state, dispatch };
}
