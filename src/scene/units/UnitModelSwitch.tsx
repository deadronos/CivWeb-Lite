// Filename remains PascalCase to match exported component names; bulk renames will be
// done in a separate refactor PR to avoid noisy import changes across the repo.
/* eslint-disable unicorn/filename-case -- defer renaming files to a dedicated PR */
import React from 'react';
import { gltfEnabled } from '../../utils/flags';
import GLTFModel from '../drei/GLTFModel';
import { WarriorModel } from './procedural/WarriorModel';
import { SettlerModel } from './procedural/SettlerModel';
import { WorkerModel } from './procedural/WorkerModel';
import { ArcherModel } from './procedural/ArcherModel';
import { SpearmanModel } from './procedural/SpearmanModel';
import { GalleyModel } from './procedural/GalleyModel';
import { getModelComponent } from './modelRegistry';

export type UnitModelProps = {
  type: string;
  teamColor?: string;
  position?: [number, number, number];
  scale?: number | [number, number, number];
  id?: string;
  rangedReady?: boolean;
  model?: string;
  offsetY?: number;
  anim?: { bobAmp?: number; bobSpeed?: number };
  gltf?: string;
};

// Note: GLTF paths are resolved via `gltfRegistry`. If you need a static map later,
// add it to `gltfRegistry` or export a dedicated mapping module.

import { Bob, phaseFromId } from './Bob';
import { resolveGLTF } from './gltfRegistry';

export function UnitModelSwitch({
  type,
  teamColor = '#bdc3c7',
  position,
  scale,
  id,
  rangedReady,
  model,
  offsetY,
  anim,
  gltf,
}: UnitModelProps) {
  const lowerType = type.toLowerCase();
  const modelLabel = (model || '').toLowerCase();
  if (gltfEnabled()) {
    const url = resolveGLTF(gltf || modelLabel || lowerType);
    if (url) return <GLTFModel url={url} position={position} scale={scale ?? 0.6} />;
  }

  const CommonWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <group
      position={[position?.[0] ?? 0, (position?.[1] ?? 0) + (offsetY ?? 0), position?.[2] ?? 0]}
      scale={scale ?? 1}
    >
      {children}
    </group>
  );
  const phase = phaseFromId(id);

  // Use labeled model if provided in data registry
  const Labeled = getModelComponent(modelLabel);
  if (Labeled) {
    return (
      <CommonWrap>
        <Bob amplitude={anim?.bobAmp ?? 0.04} speed={anim?.bobSpeed ?? 0.35} phase={phase}>
          {/* Archer supports showArrow; other models ignore prop */}
          <Labeled
            teamColor={teamColor}
            {...(lowerType === 'archer' ? { showArrow: !!rangedReady } : {})}
          />
        </Bob>
      </CommonWrap>
    );
  }

  switch (lowerType) {
  case 'warrior': {
      return (
        <CommonWrap>
          <Bob amplitude={anim?.bobAmp ?? 0.05} speed={anim?.bobSpeed ?? 0.35} phase={phase}>
            <WarriorModel teamColor={teamColor} />
          </Bob>
        </CommonWrap>
      );
    }
  case 'spearman': {
      return (
        <CommonWrap>
          <Bob amplitude={anim?.bobAmp ?? 0.05} speed={anim?.bobSpeed ?? 0.35} phase={phase}>
            <SpearmanModel teamColor={teamColor} />
          </Bob>
        </CommonWrap>
      );
    }
  case 'archer': {
      return (
        <CommonWrap>
          <Bob amplitude={anim?.bobAmp ?? 0.05} speed={anim?.bobSpeed ?? 0.4} phase={phase}>
            <ArcherModel teamColor={teamColor} showArrow={!!rangedReady} />
          </Bob>
        </CommonWrap>
      );
    }
  case 'settler': {
      return (
        <CommonWrap>
          <Bob amplitude={anim?.bobAmp ?? 0.03} speed={anim?.bobSpeed ?? 0.3} phase={phase}>
            <SettlerModel teamColor={teamColor} />
          </Bob>
        </CommonWrap>
      );
    }
  case 'worker': {
      return (
        <CommonWrap>
          <Bob amplitude={anim?.bobAmp ?? 0.03} speed={anim?.bobSpeed ?? 0.45} phase={phase}>
            <WorkerModel teamColor={teamColor} />
          </Bob>
        </CommonWrap>
      );
    }
  case 'galley': {
      return (
        <CommonWrap>
          <group>
            <Bob amplitude={anim?.bobAmp ?? 0.02} speed={anim?.bobSpeed ?? 0.25} phase={phase}>
              <GalleyModel teamColor={teamColor} />
            </Bob>
          </group>
        </CommonWrap>
      );
    }
  default: {
      return (
        <CommonWrap>
          {/* Minimal placeholder for unknown types */}
          <mesh>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={teamColor} />
          </mesh>
        </CommonWrap>
      );
    }
  }
}
