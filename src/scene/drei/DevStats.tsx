import React from 'react';
import { Stats } from '@react-three/drei';

type Properties = React.ComponentProps<typeof Stats> & {
  enabled?: boolean;
};

export default function DevelopmentStats({ enabled = true, ...rest }: Properties) {
  if (!enabled) return null;
  return <Stats {...rest} />;
}
