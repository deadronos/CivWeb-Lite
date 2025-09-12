import React from 'react';
import { preloadProceduralUnits } from './procedural/shared';

/**
 * @file This file contains the ProceduralPreload component, which preloads the procedural unit models.
 */

/**
 * A component that preloads the procedural unit models.
 * @returns null
 */
export default function ProceduralPreload() {
  React.useEffect(() => {
    try {
      preloadProceduralUnits();
    } catch {
      // ignore in SSR/tests
    }
  }, []);
  return null;
}
