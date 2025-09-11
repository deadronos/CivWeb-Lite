import React from 'react';
import { Stats } from '@react-three/drei';

type Properties = React.ComponentProps<typeof Stats> & {
  enabled?: boolean;
  'data-testid'?: string;
  testid?: string;
};

export default function DevelopmentStats({ enabled = true, 'data-testid': _dataTestId, testid: _testid, ...rest }: Properties) {
  if (!enabled) return null;
  return <Stats {...rest} />;
}
