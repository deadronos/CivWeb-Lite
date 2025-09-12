import React from 'react';
import { StickFigure } from './stick-figure';

/**
 * @file This file contains the SettlerModel component, which is a procedural model for the settler unit.
 */

/**
 * A procedural model for the settler unit.
 * @param props - The component properties.
 * @param props.teamColor - The color of the team.
 * @returns The rendered component.
 */
export function SettlerModel({ teamColor = '#f1c40f' }: { teamColor?: string }) {
  return <StickFigure teamColor={teamColor} accessories={{ staff: true, backpack: true }} />;
}

/**
 * The label for the settler model.
 */
export const MODEL_LABEL = 'settler';
