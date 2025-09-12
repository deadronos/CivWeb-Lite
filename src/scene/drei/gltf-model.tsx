// Filename is PascalCase to mirror the exported React component name. A repo-wide
// filename rename will be done in a dedicated refactor to avoid touching many imports.
import React from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * @file This file contains the GLTFModel component, which is a wrapper around the drei useGLTF hook.
 */

/**
 * Represents the properties for the GLTFModel component.
 * @property url - The URL of the GLTF model.
 * @property transform - The transform to apply to the model.
 */
export type GLTFModelProperties = {
  url: string;
  // optional transform and presentation props forwarded to the primitive
  transform?: {
    position?: [number, number, number];
    scale?: number | [number, number, number];
    rotation?: [number, number, number];
  };
} & Record<string, any>;

/**
 * A wrapper component around the drei useGLTF hook.
 * @param props - The component properties.
 * @returns The rendered component.
 */
export const GLTFModel: React.FC<GLTFModelProperties> = ({ url, transform, ...rest }) => {
  // In non-DOM/test environments, avoid calling Drei hooks which rely on WebGL.
  if (globalThis.window === undefined) {
    return (
      <mesh {...transform} {...rest}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#999" />
      </mesh>
    );
  }

  // In the browser, use the Drei loader and render the model; if loading fails at runtime
  // the component may still throw — keep it simple and let the app surface the error.
  const gltf: any = useGLTF(url);
  const scene = gltf.scene || gltf;
  return <primitive object={scene} {...transform} {...rest} />;
};

export default GLTFModel;

/**
 * A preloading helper for GLTF models.
 * @param url - The URL of the GLTF model to preload.
 */
export function preloadGLTF(url: string) {
  try {
    // useGLTF.preload may be provided at runtime by Drei; call if present.
    // The `preload` helper is sometimes added by Drei at runtime and may be missing
    // from the local TypeScript types in our test environment. Suppress the type
    // error for this specific runtime helper.
    // @ts-ignore: runtime helper provided by drei
    useGLTF.preload?.(url);
  } catch {
    // ignore in tests
  }
}
