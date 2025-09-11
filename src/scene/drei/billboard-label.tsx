import React from 'react';
import { Billboard, Text } from '@react-three/drei';

type Properties = React.ComponentProps<typeof Text> & {
  /** If false, do not render */
  enabled?: boolean;
  /** Testing-only DOM attribute (ignored for three objects) */
  'data-testid'?: string;
  /** Alias for testing-only attribute */
  testid?: string;
};

export default function BillboardLabel({
  enabled = true,
  children,
  // Strip DOM-only testing attributes so they don't reach three/fiber
  'data-testid': _dataTestId,
  testid: _testid,
  ...rest
}: Properties) {
  if (!enabled) return null;
  return (
    <Billboard>
      <Text {...rest}>{children}</Text>
    </Billboard>
  );
}
