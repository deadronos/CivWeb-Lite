import React, { useMemo } from 'react';
import { useGame } from '../../hooks/use-game';
import { ResearchPanel } from './research-panel';

export function ResearchPanelContainer({ playerId }: { playerId: string }) {
  const { state, dispatch } = useGame();
  const player = state.players.find(p => p.id === playerId);
  const extension = state.contentExt;
  
  if (!player || !extension) return undefined;

  const currentResearch = player.researching;
  const queue = player.researchQueue || [];
  
  const availableTechs = useMemo(() => 
    state.techCatalog
      .filter(tech => 
        !player.researchedTechIds.includes(tech.id) &&
        currentResearch?.techId !== tech.id &&
        !queue.includes(tech.id) &&
        tech.prerequisites.every(pr => player.researchedTechIds.includes(pr))
      )
      .map(tech => ({
        id: tech.id,
        label: tech.name,
        cost: tech.cost,
        prerequisites: tech.prerequisites,
      }))
  , [state.techCatalog, player.researchedTechIds, currentResearch, queue]);

  const handleAutoRecommend = () => {
    if (availableTechs.length > 0) {
      const recommended = availableTechs[0].id; // Simple: first available
      dispatch({ type: 'START_RESEARCH', payload: { playerId, techId: recommended } });
    }
  };

  return (
    <ResearchPanel
      playerId={playerId}
      currentResearch={currentResearch ? { id: currentResearch.techId, progress: currentResearch.progress } : undefined}
      queue={queue.map(id => ({ id, progress: 0 }))} // Progress not tracked for queue yet
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