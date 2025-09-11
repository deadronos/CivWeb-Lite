 
import React from 'react';
import { WarriorModel, MODEL_LABEL as WARRIOR } from "./procedural/warrior-model";
import { SettlerModel, MODEL_LABEL as SETTLER } from "./procedural/settler-model";
import { WorkerModel, MODEL_LABEL as WORKER } from "./procedural/worker-model";
import { ArcherModel, MODEL_LABEL as ARCHER } from "./procedural/archer-model";
import { SpearmanModel, MODEL_LABEL as SPEARMAN } from "./procedural/spearman-model";
import { GalleyModel, MODEL_LABEL as GALLEY } from "./procedural/galley-model";

export type ModelComponent = React.ComponentType<{teamColor?: string;showArrow?: boolean;}>;

const registry: Record<string, ModelComponent> = {
  [WARRIOR]: WarriorModel,
  [SETTLER]: SettlerModel,
  [WORKER]: WorkerModel,
  [ARCHER]: ArcherModel,
  [SPEARMAN]: SpearmanModel,
  [GALLEY]: GalleyModel
};

export function getModelComponent(label?: string): ModelComponent | undefined {
  if (!label) return undefined;
  return registry[label];
}

// Provide a default export to support legacy PascalCase shims that expect a
// default export. The default is an object exposing the same API surface.
export default {
  getModelComponent
};