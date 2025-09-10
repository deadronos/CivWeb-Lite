 
import React from 'react';
import { StickFigure } from "./stick-figure";

export const WarriorModel: React.FC<{teamColor?: string;}> = ({ teamColor = '#e74c3c' }) => {
  return <StickFigure teamColor={teamColor} accessories={{ spear: true }} />;
};

export const MODEL_LABEL = 'warrior';

export default WarriorModel;