import React from 'react';
import { StickFigure } from './StickFigure';

export function ArcherModel({ teamColor = '#9b59b6', showArrow = false }: { teamColor?: string; showArrow?: boolean }) {
  return <StickFigure teamColor={teamColor} accessories={{ bow: true, arrow: showArrow }} />;
}

export const MODEL_LABEL = 'archer';
