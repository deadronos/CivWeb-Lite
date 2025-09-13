import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGame } from '../../hooks/use-game';
import { UnitState } from '../../types/unit';
import { computeMovementRange } from '../../game/pathfinder';
import { axialToWorld } from '../../scene/utils/coords';
import { DEFAULT_HEX_SIZE } from '../../scene/utils/coords';

interface MovementRangeOverlayProperties {
  selectedUnitId?: string;
}

export function MovementRangeOverlay({ selectedUnitId }: MovementRangeOverlayProperties) {
  const { state, dispatch } = useGame();

  // Snapshot references used below; avoid non-null assertions before checks
  const content = state.contentExt;
  const unit = selectedUnitId && content ? content.units[selectedUnitId] : undefined;

  // Be tolerant to tests or extensions that use string literals for states
  const movedFlag = Boolean(
    unit?.activeStates?.has?.(UnitState.Moved) ||
      ((unit?.activeStates as unknown as Set<string>)?.has?.('moved') ?? false),
  );

  // Only compute range if we have a valid starting tile for the unit.
  const hasValidStart = (() => {
    if (!unit || !content) return false;
    const loc = (unit as any)?.location;
    const locId = typeof loc === 'string' ? loc : undefined;
    return Boolean(locId && content.tiles[locId]);
  })();

  // IMPORTANT: call hooks unconditionally in the same order each render
  const range = useMemo(() => {
    if (!selectedUnitId || !content || !hasValidStart || !unit || movedFlag) {
      return { reachable: [] as string[], cost: {} as Record<string, number> };
    }
    return computeMovementRange(content, selectedUnitId, state.map.width, state.map.height);
  }, [selectedUnitId, content, hasValidStart, unit, movedFlag, state.map.width, state.map.height]);

  // After all hooks: decide whether to render
  if (!selectedUnitId || !content || !unit || movedFlag) {
    return; // no overlay, but hooks were still called in a stable order
  }

  // Resolve selected unit owner for enemy detection
  const unitOwner = unit.ownerId;

  return (
    <group>
      {/* Hidden DOM test hook: Html mounts a real DOM node so tests and Playwright can query
          the presence of the overlay without forwarding data-* props into three.js objects. */}
      <Html center style={{ pointerEvents: 'none' }}>
        <div data-testid="movement-range-overlay" className="e2e-hidden-helper" />
      </Html>
      {range.reachable.map((tileId) => {
        const tile = content.tiles[tileId];
        if (!tile) {
          return; // skip invalid tiles
        }

        // World position for overlay label
        const [x, z] = axialToWorld(tile.q, tile.r, DEFAULT_HEX_SIZE);

        // Enemy detection for labeling (unit or city owned by another player)
        let enemyPresent = false;
        if (tile.occupantUnitId) {
          const occ = content.units[tile.occupantUnitId];
          if (occ && occ.ownerId !== unitOwner) enemyPresent = true;
        }
        if (tile.occupantCityId) {
          const city = content.cities[tile.occupantCityId];
          if (city && city.ownerId !== unitOwner) enemyPresent = true;
        }

        // Visual 3D hint (semi-transparent plane) remains for in-canvas feedback
        const hint = (
          <mesh position={[x, 0.01, z] as any}>
            <planeGeometry args={[DEFAULT_HEX_SIZE * Math.sqrt(3), DEFAULT_HEX_SIZE * 1.5]} />
            <meshBasicMaterial color="blue" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        );

        // DOM proxy for Playwright selectors and interactions
        const handleHover = () => {
          dispatch({ type: 'PREVIEW_PATH', payload: { unitId: selectedUnitId, targetTileId: tileId } } as any);
        };
        const handleClick = () => {
          // Use existing previewPath if present; otherwise issue a direct step to tile
          const path = (state.ui.previewPath && Array.isArray(state.ui.previewPath) && state.ui.previewPath.length > 0)
            ? state.ui.previewPath
            : [tileId];
          dispatch({
            type: 'ISSUE_MOVE',
            payload: { unitId: selectedUnitId, path, confirmCombat: enemyPresent },
          } as any);
        };

        return (
          <group key={tileId}>
            {hint}
            <Html center position={[x, 0.06, z] as any} occlude>
              <div
                // Use role button for accessibility and visibility to Playwright
                role="button"
                tabIndex={0}
                data-testid={enemyPresent ? 'enemy-tile' : 'hex-bucket'}
                className={`e2e-hex-proxy${enemyPresent ? ' enemy' : ''}`}
                aria-label={enemyPresent ? 'Enemy tile' : 'Tile'}
                title={enemyPresent ? 'Enemy tile' : 'Tile'}
                onMouseEnter={handleHover}
                onClick={handleClick}
              />
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default MovementRangeOverlay;
