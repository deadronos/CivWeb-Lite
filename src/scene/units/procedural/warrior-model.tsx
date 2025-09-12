import React from 'react';
import { StickFigure } from './stick-figure';

/**
 * @file This file contains the WarriorModel component, which is a procedural model for the warrior unit.
 */

/**
 * A procedural model for the warrior unit.
 * @param props - The component properties.
 * @param props.teamColor - The color of the team.
 * @returns The rendered component.
 */
export const WarriorModel: React.FC<{ teamColor?: string }> = ({ teamColor = '#e74c3c' }) => {
  return <StickFigure teamColor={teamColor} accessories={{ spear: true }} />;
};

/**
 * The label for the warrior model.
 */
export const MODEL_LABEL = 'warrior';

export default WarriorModel;
