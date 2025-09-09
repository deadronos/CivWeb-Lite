import React from 'react';
import Minimap from './Minimap';
import { useGame } from '../../hooks/useGame';
import { useCamera } from '../../hooks/useCamera';

export default function MinimapContainer() {
  const { state } = useGame();
  const camera = useCamera();
  const onPickCoord = React.useCallback((coord: { q: number; r: number }) => {
    camera.centerOn(coord);
  }, [camera]);
  return <Minimap width={state.map.width} height={state.map.height} onPickCoord={onPickCoord} />;
}

