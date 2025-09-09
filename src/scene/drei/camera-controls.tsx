import React from 'react';
import { OrbitControls } from '@react-three/drei';

type Properties = React.ComponentProps<typeof OrbitControls> & {
  enabled?: boolean;
  'data-testid'?: string;
  testid?: string;
};

export default function CameraControls({ enabled = true, 'data-testid': _dataTestId, testid: _testid, ...rest }: Properties) {
  if (!enabled) return null;
  return (
    // Sensible defaults, caller can override via props
    <OrbitControls enablePan enableRotate enableZoom {...rest} />
  );
}
