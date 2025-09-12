import React from 'react';
import { StickFigure } from './stick-figure';

/**
 * @file This file contains the ArcherModel component, which is a procedural model for the archer unit.
 */

/**
 * A procedural model for the archer unit.
 * @param props - The component properties.
 * @param props.teamColor - The color of the team.
 * @param props.showArrow - Whether to show the arrow.
 * @returns The rendered component.
 */
export const ArcherModel: React.FC<{ teamColor?: string; showArrow?: boolean }> = ({
  teamColor = '#9b59b6',
  showArrow = false,
}) => {
  return <StickFigure teamColor={teamColor} accessories={{ bow: true, arrow: showArrow }} />;
};

/**
 * The label for the archer model.
 */
export const MODEL_LABEL = 'archer';

export default ArcherModel;
