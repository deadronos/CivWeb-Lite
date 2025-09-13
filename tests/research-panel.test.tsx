import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ResearchPanel } from '../src/components/ui/research-panel';

const tech = { id: 'pottery', label: 'Pottery', cost: 20 };

describe('ResearchPanel', () => {
  it('calls callbacks when starting or queuing research', () => {
    const startSpy = vi.fn();
    const queueSpy = vi.fn();
    render(
      <ResearchPanel
        playerId="p1"
        currentResearch={undefined as any}
        queue={[]}
        availableTechs={[tech]}
        onStartResearch={startSpy}
        onQueueResearch={queueSpy}
        onAutoRecommend={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Pottery'));
    expect(startSpy).toHaveBeenCalledWith('pottery');

    fireEvent.click(screen.getByText('Queue'));
    expect(queueSpy).toHaveBeenCalledWith('pottery');
  });
});
