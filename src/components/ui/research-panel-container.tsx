import React, { useMemo } from 'react';
import { useGame } from '../../hooks/use-game';
import { ResearchPanel } from './research-panel';

export function ResearchPanelContainer({ playerId }: { playerId: string }) {
  const { state, dispatch } = useGame();
  const extension = state.contentExt;
  
  if (!extension) return null;

  const currentResearch = extension.playerState.research;
  
  // Mock available techs for now - in a real implementation this would filter based on prerequisites
  const availableTechs = useMemo(() => [
    { id: 'agriculture', label: 'Agriculture', cost: 20, prerequisites: [] },
    { id: 'animal_husbandry', label: 'Animal Husbandry', cost: 25, prerequisites: [] },
    { id: 'pottery', label: 'Pottery', cost: 25, prerequisites: [] },
    { id: 'mining', label: 'Mining', cost: 35, prerequisites: [] },
    { id: 'sailing', label: 'Sailing', cost: 50, prerequisites: ['pottery'] },
    { id: 'bronze_working', label: 'Bronze Working', cost: 55, prerequisites: ['mining'] },
  ], []);

  // Mock queue for now - would need to implement queue system
  const queue: string[] = [];

  return (
    <ResearchPanel
      playerId={playerId}
      currentResearch={currentResearch}
      queue={queue}
      availableTechs={availableTechs}
      onStartResearch={(techId) => {
        dispatch({ type: 'START_RESEARCH', payload: { playerId, techId } });
      }}
      onQueueResearch={(techId) => {
        dispatch({ type: 'QUEUE_RESEARCH', payload: { playerId, techId } });
      }}
      onAutoRecommend={() => {
        // TODO: Implement auto-recommend logic
        console.log('Auto-recommend research for', playerId);
      }}
    />
  );
}

export default ResearchPanelContainer;