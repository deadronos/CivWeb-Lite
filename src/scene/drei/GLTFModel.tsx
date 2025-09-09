import React from 'react';
import { useGLTF } from '@react-three/drei';

type Props = {
  url: string;
  /** Optional scale/position/rotation passed to primitive */
  [key: string]: any;
};

export default function GLTFModel({ url, ...rest }: Props) {
  // Fail-safe for tests: wrap in try/catch and render a placeholder if load fails
  try {
    const gltf: any = useGLTF(url);
    const scene = gltf.scene || gltf;
    return <primitive object={scene} {...rest} />;
  } catch (e) {
    return (
      <mesh {...rest}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#999" />
      </mesh>
    );
  }
}

// Drei recommendation: preloading helper
export function preloadGLTF(url: string) {
  try {
    // @ts-expect-error - useGLTF.preload is provided by Drei runtime; tests may not include types
    useGLTF.preload?.(url);
  } catch {
    // ignore in tests
  }
}

