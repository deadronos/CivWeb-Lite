// Filename remains PascalCase to match exported component names; bulk renames will be
// done in a separate refactor PR to avoid noisy import changes across the repo.
import React from 'react';
import { gltfEnabled } from '../../utils/flags';
import { WarriorModel } from './procedural/warrior-model';
import { SettlerModel } from './procedural/settler-model';
import { WorkerModel } from './procedural/worker-model';
import { ArcherModel } from './procedural/archer-model';
import { SpearmanModel } from './procedural/spearman-model';
import { GalleyModel } from './procedural/galley-model';
import { getModelComponent } from './model-registry';

export type UnitModelProperties = {
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

// Backward-compatible alias for code that used the previous name
// Backward-compatible alias for code that used the previous name
// eslint-disable-next-line unicorn/prevent-abbreviations -- keep legacy alias to avoid mass import updates; remove in dedicated refactor
export type UnitModelProps = UnitModelProperties;

// Note: GLTF paths are resolved via `gltfRegistry`. If you need a static map later,
// add it to `gltfRegistry` or export a dedicated mapping module.

import { Bob, phaseFromId } from './bob';
// Lazy GLTF pipeline: only pull code when flag is enabled
const LazyGLTFModel = React.lazy(() =>
  import(String.raw`../drei/gltf-model`).then((m) => ({ default: m.default }))
);

export const UnitModelSwitch: React.FC<UnitModelProps> = ({
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
}) => {
  const lowerType = type.toLowerCase();
  const modelLabel = (model || '').toLowerCase();
  const [gltfUrl, setGltfUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!gltfEnabled()) return;
    let mounted = true;
    import('./gltf-registry').then(({ resolveGLTF }) => {
      if (!mounted) return;
      const url = resolveGLTF(gltf || modelLabel || lowerType);
      setGltfUrl(url);
    });
    return () => {
      mounted = false;
    };
  }, [gltf, modelLabel, lowerType]);
  if (gltfEnabled() && gltfUrl) {
    return (
      <React.Suspense fallback={null}>
        <LazyGLTFModel url={gltfUrl} position={position} scale={scale ?? 0.6} />
      </React.Suspense>
    );
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
};
