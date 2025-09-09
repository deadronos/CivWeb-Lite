import React from 'react';
import { StickFigure } from './StickFigure';

export function SpearmanModel({ teamColor = '#16a085' }: { teamColor?: string }) {
  return <StickFigure teamColor={teamColor} accessories={{ spear: true }} />;
}

export const MODEL_LABEL = 'spearman';
