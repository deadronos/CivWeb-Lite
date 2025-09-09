import React from 'react';
import { Billboard, Text } from '@react-three/drei';

type Properties = React.ComponentProps<typeof Text> & {
  /** If false, do not render */
  enabled?: boolean;
};

export default function BillboardLabel({ enabled = true, children, ...rest }: Properties) {
  if (!enabled) return null;
  return (
    <Billboard>
      <Text {...rest}>{children}</Text>
    </Billboard>
  );
}
