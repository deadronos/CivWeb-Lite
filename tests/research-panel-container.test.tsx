import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ResearchPanelContainer from '../src/components/ui/research-panel-container';

const dispatch = vi.fn();
vi.mock('../src/hooks/use-game', () => ({
  useGame: () => ({
    state: {
      players: [{ id: 'p1', researching: undefined, researchQueue: [], researchedTechIds: [], isHuman: true }],
      techCatalog: [],
      contentExt: {},
    },
    dispatch,
  }),
}));

vi.mock('../src/hooks/use-available-techs', () => ({
  useAvailableTechs: () => [{ id: 'pottery', label: 'Pottery', cost: 20, prerequisites: [] }],
}));

describe('ResearchPanelContainer', () => {
  it('dispatches start and queue actions', () => {
    render(<ResearchPanelContainer playerId="p1" />);

    fireEvent.click(screen.getByText('Pottery'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'START_RESEARCH', payload: { playerId: 'p1', techId: 'pottery' } });

    fireEvent.click(screen.getByText('Queue'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'QUEUE_RESEARCH', payload: { playerId: 'p1', techId: 'pottery' } });
  });
});
