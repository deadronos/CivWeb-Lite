import React from 'react';

type Properties = {
  url: string;
  position?: [number, number, number];
  scale?: number | [number, number, number];
};

const LazyGLTFModelInner = React.lazy(() => import('./gltf-model').then((m) => ({ default: m.default })) as any);

export const LazyGLTFModelWrapper: React.FC<Properties> = ({ url, position, scale }) => (
  <React.Suspense fallback={null}>
    {/* cast to any inside to avoid prop mismatch issues with upstream Drei types */}
    {React.createElement(LazyGLTFModelInner as any, { url, position, scale })}
  </React.Suspense>
);

export default LazyGLTFModelWrapper;
