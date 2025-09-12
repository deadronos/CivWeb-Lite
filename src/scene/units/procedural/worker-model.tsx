import React from 'react';
import { StickFigure } from './stick-figure';

/**
 * @file This file contains the WorkerModel component, which is a procedural model for the worker unit.
 */

/**
 * A procedural model for the worker unit.
 * @param props - The component properties.
 * @param props.teamColor - The color of the team.
 * @returns The rendered component.
 */
export function WorkerModel({ teamColor = '#2ecc71' }: { teamColor?: string }) {
  return <StickFigure teamColor={teamColor} accessories={{ hammer: true }} />;
}

/**
 * The label for the worker model.
 */
export const MODEL_LABEL = 'worker';
