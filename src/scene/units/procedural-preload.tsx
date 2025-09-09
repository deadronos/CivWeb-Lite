import React from 'react';
import { preloadProceduralUnits } from './procedural/shared';

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
