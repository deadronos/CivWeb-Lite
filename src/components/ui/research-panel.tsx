import React from 'react';
import type { ResearchPanelProps as ResearchPanelProperties } from '../../game/types/ui';

/**
 * @file This file contains the ResearchPanel component, which displays the research options for a player.
 */

/**
 * A component that displays the research options for a player.
 * @param props - The component properties.
 * @param props.playerId - The ID of the player.
 * @param props.currentResearch - The technology the player is currently researching.
 * @param props.queue - The research queue of the player.
 * @param props.availableTechs - An array of technologies that can be researched.
 * @param props.onStartResearch - A callback function to start researching a technology.
 * @param props.onQueueResearch - A callback function to queue a technology for research.
 * @param props.onAutoRecommend - A callback function to automatically recommend a technology to research.
 * @returns The rendered component.
 */
export function ResearchPanel({
  playerId,
  currentResearch,
  queue,
  availableTechs,
  onStartResearch,
  onQueueResearch,
  onAutoRecommend,
}: ResearchPanelProperties) {
  return (
    <div data-testid="research-panel">
      <h3>Research (Player {playerId})</h3>
      <div>Current: {currentResearch ? currentResearch.techId : 'none'}</div>
      <ul>
        {availableTechs.map((t) => (
          <li key={t.id}>
            <button onClick={() => onStartResearch(t.id)}>{t.label}</button>
            <button onClick={() => onQueueResearch(t.id)}>Queue</button>
          </li>
        ))}
      </ul>
      <div>Queue: {queue.join(', ')}</div>
      {onAutoRecommend && (
        <button onClick={onAutoRecommend} style={{ display: 'none' }}>
          auto
        </button>
      )}
    </div>
  );
}

export default ResearchPanel;
