import React from 'react';
import { useGLTF } from '@react-three/drei';

type GLTFModelProperties = {
  url: string;
  // optional transform and presentation props forwarded to the primitive
  transform?: { position?: [number, number, number]; scale?: number | [number, number, number]; rotation?: [number, number, number] };
} & Record<string, any>;

export default function GLTFModel({ url, transform, ...rest }: GLTFModelProperties) {
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
}

// Drei recommendation: preloading helper
export function preloadGLTF(url: string) {
  try {
    // useGLTF.preload may be provided at runtime by Drei; call if present
  // The `preload` helper is sometimes added by Drei at runtime and may be missing
  // from the local TypeScript types in our test environment. Suppress the type
  // error for this specific runtime helper.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- runtime helper may be untyped
  // @ts-ignore: runtime helper provided by drei
  useGLTF.preload?.(url);
  } catch {
    // ignore in tests
  }
}
