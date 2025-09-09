/* eslint-disable unicorn/filename-case -- defer filename renames to a dedicated codemod PR that updates imports */
import React from 'react';
import { useGame } from "..\\hooks\\use-game";
import { useUnitPositions } from './hooks/use-unit-positions';
import { playerColor } from './utils/colors';
import { UnitModelSwitch } from './units/unit-model-switch';
import unitsData from '../data/units.json';
import { UNIT_TYPES } from '../game/content/registry';
import { distance } from '../game/world/hex';

export const UnitMeshes: React.FC = () => {
  const { state } = useGame();
  const positions = useUnitPositions({ y: 0.01 });
  // Returning null is the standard React convention for rendering nothing here.
  // eslint-disable-next-line unicorn/no-null -- React component render: return null to render nothing
  if (!state.contentExt) return null;
  const extension = state.contentExt;
  const rangedByType: Record<string, {ranged: boolean;range: number;}> = Object.fromEntries(
    (unitsData as any[]).map((u: any) => [
    u.id,
    { ranged: !!u.ranged, range: typeof u.range === 'number' ? u.range : 2 }]
    )
  );
  return (
    <group>
      {positions.map((u) => {
        // Resolve owner and team color from ext units
        const unit = extension.units[u.id];
        const color = unit ? playerColor(state, unit.ownerId) : '#bdc3c7';
        // Determine ranged readiness (show arrow) when enemy is within range for ranged units
        let rangedReady = false;
        const meta = rangedByType[unit?.type ?? ''];
        if (unit && meta?.ranged) {
          const locId = unit.location as string;
          const selfTile = extension.tiles[locId];
          if (selfTile) {
            for (const other of Object.values(extension.units) as any[]) {
              if ((other as any).ownerId === unit.ownerId) continue;
              const otherTile = extension.tiles[(other as any).location as string];
              if (!otherTile) continue;
              const d = distance(
                { q: selfTile.q, r: selfTile.r },
                { q: otherTile.q, r: otherTile.r }
              );
              if (d > 0 && d <= (meta.range || 2)) {
                rangedReady = true;
                break;
              }
            }
          }
        }
        const unitDefinition = UNIT_TYPES[u.type];
        const model = unitDefinition?.visual?.model ?? unitDefinition?.model ?? undefined;
        const gltf = unitDefinition?.visual?.gltf ?? undefined;
        const offsetY = unitDefinition?.visual?.offsetY ?? (unitDefinition?.domain === 'naval' ? 0.06 : 0);
        const anim = unitDefinition?.visual?.anim;
        const vScale = unitDefinition?.visual?.scale;
        return (
          <UnitModelSwitch
            key={u.id}
            type={u.type}
            teamColor={color}
            position={u.position}
            scale={vScale ?? 1}
            id={u.id}
            rangedReady={rangedReady}
            model={model}
            gltf={gltf}
            offsetY={offsetY}
            anim={anim} />);


      })}
    </group>);

};

export default UnitMeshes;