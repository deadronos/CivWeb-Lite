import React from 'react';
import { useGame } from '../../hooks/use-game';
import { useAvailableTechs } from '../../hooks/use-available-techs';
import { ResearchPanel } from './research-panel';

/**
 * @file This file contains the ResearchPanelContainer component, which is a container for the ResearchPanel component.
 */

/**
 * A container component for the ResearchPanel component.
 * It fetches the research data for a player and passes it to the ResearchPanel component.
 * @param props - The component properties.
 * @param props.playerId - The ID of the player.
 * @returns The rendered component, or null if the player or game state extension is not found.
 */
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