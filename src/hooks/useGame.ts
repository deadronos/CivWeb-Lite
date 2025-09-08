import { useGameContext } from '../contexts/GameProvider';

export function useGame() {
  return useGameContext();
}

export default useGame;
