import React from 'react';
import { Billboard, Text } from '@react-three/drei';

/**
 * @file This file contains the BillboardLabel component, which is a wrapper around the drei Billboard and Text components.
 */

/**
 * Represents the properties for the BillboardLabel component.
 * @property enabled - If false, do not render.
 * @property 'data-testid' - Testing-only DOM attribute (ignored for three objects).
 * @property testid - Alias for testing-only attribute.
 */
type Properties = React.ComponentProps<typeof Text> & {
  /** If false, do not render */
  enabled?: boolean;
  /** Testing-only DOM attribute (ignored for three objects) */
  'data-testid'?: string;
  /** Alias for testing-only attribute */
  testid?: string;
};

/**
 * A wrapper component around the drei Billboard and Text components.
 * @param props - The component properties.
 * @returns The rendered component, or null if not enabled.
 */
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
