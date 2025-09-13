import React from 'react';
import { Line } from '@react-three/drei';
import { useGame } from '../hooks/use-game';
import { useSelection } from '../contexts/selection-context';
import { axialToWorld, DEFAULT_HEX_SIZE } from './utils/coords';

export function SelectedHexOutline() {
  const { state } = useGame();
  const { selectedUnitId } = useSelection();
  const points = React.useMemo(() => {
    const ext = state.contentExt;
    if (!ext || !selectedUnitId) return undefined;
    const unit = ext.units[selectedUnitId];
    if (!unit) return undefined;
    const loc = unit.location;
    const tileId = typeof loc === 'string' ? loc : `${(loc as any).q},${(loc as any).r}`;
    const tile = ext.tiles[tileId];
    if (!tile) return undefined;
    const [x, z] = axialToWorld(tile.q, tile.r, DEFAULT_HEX_SIZE);
    const r = DEFAULT_HEX_SIZE * 1.05;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      pts.push([x + r * Math.cos(angle), 0.05, z + r * Math.sin(angle)]);
    }
    return pts;
  }, [state.contentExt, selectedUnitId]);
  if (!points) return null;
  return <Line points={points} color="yellow" lineWidth={2} />;
}

export default SelectedHexOutline;
