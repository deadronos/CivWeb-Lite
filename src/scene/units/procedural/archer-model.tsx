import React from 'react';
import { StickFigure } from './stick-figure';

export const ArcherModel: React.FC<{ teamColor?: string; showArrow?: boolean }> = ({
  teamColor = '#9b59b6',
  showArrow = false,
}) => {
  return <StickFigure teamColor={teamColor} accessories={{ bow: true, arrow: showArrow }} />;
};

export const MODEL_LABEL = 'archer';

export default ArcherModel;
