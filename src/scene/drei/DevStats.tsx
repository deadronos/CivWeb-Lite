import React from 'react';
import { Stats } from '@react-three/drei';

type Props = React.ComponentProps<typeof Stats> & {
  enabled?: boolean;
};

export default function DevStats({ enabled = true, ...rest }: Props) {
  if (!enabled) return null;
  return <Stats {...rest} />;
}
