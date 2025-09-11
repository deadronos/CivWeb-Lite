import React from 'react';
import { StickFigure } from './stick-figure';

export function SettlerModel({ teamColor = '#f1c40f' }: { teamColor?: string }) {
  return <StickFigure teamColor={teamColor} accessories={{ staff: true, backpack: true }} />;
}

export const MODEL_LABEL = 'settler';
