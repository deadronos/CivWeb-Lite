import React from 'react';
import { OrbitControls } from '@react-three/drei';

type Props = React.ComponentProps<typeof OrbitControls> & {
  enabled?: boolean;
};

export default function CameraControls({ enabled = true, ...rest }: Props) {
  if (!enabled) return null;
  return (
    // Sensible defaults, caller can override via props
    <OrbitControls enablePan enableRotate enableZoom {...rest} />
  );
}

