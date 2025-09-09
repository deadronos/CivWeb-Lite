import React from 'react';
import { StickFigure } from './StickFigure';

export function WarriorModel({ teamColor = '#e74c3c' }: { teamColor?: string }) {
  return <StickFigure teamColor={teamColor} accessories={{ spear: true }} />;
}

export const MODEL_LABEL = 'warrior';
