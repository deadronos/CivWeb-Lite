import React from 'react';
import { WarriorModel, MODEL_LABEL as WARRIOR } from './procedural/WarriorModel';
import { SettlerModel, MODEL_LABEL as SETTLER } from './procedural/SettlerModel';
import { WorkerModel, MODEL_LABEL as WORKER } from './procedural/WorkerModel';
import { ArcherModel, MODEL_LABEL as ARCHER } from './procedural/ArcherModel';
import { SpearmanModel, MODEL_LABEL as SPEARMAN } from './procedural/SpearmanModel';
import { GalleyModel, MODEL_LABEL as GALLEY } from './procedural/GalleyModel';

export type ModelComponent = (props: { teamColor?: string }) => React.ReactNode;

const components: Record<string, any> = {
  [WARRIOR]: WarriorModel,
  [SETTLER]: SettlerModel,
  [WORKER]: WorkerModel,
  [ARCHER]: ArcherModel,
  [SPEARMAN]: SpearmanModel,
  [GALLEY]: GalleyModel,
};

export function getModelComponent(label?: string): any | null {
  if (!label) return null;
  return components[label] ?? null;
}
