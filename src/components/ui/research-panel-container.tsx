import React from 'react';
import { useGame } from '../../hooks/use-game';
import { useAvailableTechs } from '../../hooks/use-available-techs';
import { ResearchPanel } from './research-panel';

export function ResearchPanelContainer({ playerId }: { playerId: string }) {
  const { state, dispatch } = useGame();
  const player = state.players.find(p => p.id === playerId);
  const extension = state.contentExt;
  
  if (!player || !extension) return null;

  const currentResearch = player.researching;
  const queue = player.researchQueue || [];
  const availableTechs = useAvailableTechs(state.techCatalog, player);

  const handleAutoRecommend = () => {
    if (availableTechs.length > 0) {
      const recommended = availableTechs[0].id; // Simple: first available
      dispatch({ type: 'START_RESEARCH', payload: { playerId, techId: recommended } });
    }
  };

  return (
    <ResearchPanel
      playerId={playerId}
  currentResearch={currentResearch ? { techId: currentResearch.techId, progress: currentResearch.progress } : null}
  queue={queue.map((id) => id)}
      availableTechs={availableTechs}
      onStartResearch={(techId: string) => {
        dispatch({ type: 'START_RESEARCH', payload: { playerId, techId } });
      }}
      onQueueResearch={(techId: string) => {
        dispatch({ type: 'QUEUE_RESEARCH', payload: { playerId, techId } });
      }}
      onAutoRecommend={handleAutoRecommend}
    />
  );
}

export default ResearchPanelContainer;