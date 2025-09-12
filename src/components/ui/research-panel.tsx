import React from 'react';
import type { ResearchPanelProperties } from '../../game/types/ui';

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
        {availableTechs.map((t: { id: string; label: string; cost: number }) => (
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
