import React from 'react';
import { StickFigure } from './stick-figure';

export function WorkerModel({ teamColor = '#2ecc71' }: { teamColor?: string }) {
  return <StickFigure teamColor={teamColor} accessories={{ hammer: true }} />;
}

export const MODEL_LABEL = 'worker';
