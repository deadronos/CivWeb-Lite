import React from 'react';
import { useFrame } from '@react-three/fiber';

export function Bob({
  children,
  amplitude = 0.05,
  speed = 1.0,
  phase = 0,
}: {
  children: React.ReactNode;
  amplitude?: number;
  speed?: number;
  phase?: number;
}) {
  const ref = React.useRef<THREE.Group>(null!);
  const baseY = React.useRef<number | null>(null);
  // Guard: no-op if not in a r3f render loop (tests/SSR)
  try {
    useFrame((state) => {
      if (!ref.current) return;
      const t = state.clock.getElapsedTime?.() ?? 0;
      const cur = ref.current.position.y;
      if (baseY.current == null) baseY.current = cur;
      const y = (baseY.current ?? 0) + amplitude * Math.sin((t + phase) * speed * 2 * Math.PI);
      ref.current.position.y = y;
    });
  } catch {
    // ignore when useFrame is not available
  }
  return <group ref={ref as any}>{children}</group>;
}

export function phaseFromId(id?: string): number {
  if (!id) return 0;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000; // 0..1
}

