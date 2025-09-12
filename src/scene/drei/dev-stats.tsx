import React from 'react';
import { Stats } from '@react-three/drei';

/**
 * @file This file contains the DevelopmentStats component, which is a wrapper around the drei Stats component.
 */

/**
 * Represents the properties for the DevelopmentStats component.
 * @property enabled - If false, do not render.
 * @property 'data-testid' - Testing-only DOM attribute (ignored for three objects).
 * @property testid - Alias for testing-only attribute.
 */
type Properties = React.ComponentProps<typeof Stats> & {
  enabled?: boolean;
  'data-testid'?: string;
  testid?: string;
};

/**
 * A wrapper component around the drei Stats component.
 * @param props - The component properties.
 * @returns The rendered component, or null if not enabled.
 */
export default function DevelopmentStats({
  enabled = true,
  'data-testid': _dataTestId,
  testid: _testid,
  ...rest
}: Properties) {
  if (!enabled) return null;
  return <Stats {...rest} />;
}
