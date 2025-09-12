import React from 'react';
import { StickFigure } from './stick-figure';

/**
 * @file This file contains the SpearmanModel component, which is a procedural model for the spearman unit.
 */

/**
 * A procedural model for the spearman unit.
 * @param props - The component properties.
 * @param props.teamColor - The color of the team.
 * @returns The rendered component.
 */
export function SpearmanModel({ teamColor = '#16a085' }: { teamColor?: string }) {
  return <StickFigure teamColor={teamColor} accessories={{ spear: true }} />;
}

/**
 * The label for the spearman model.
 */
export const MODEL_LABEL = 'spearman';
