// Bob procedural unit model (canonical kebab-case implementation)
// The PascalCase shim was removed to avoid duplicate-export issues on
// case-insensitive filesystems. Keep the implementation here as the single
// source of truth.
import React from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

export function Bob({
  children,
  amplitude = 0.05,
  speed = 1,
  phase = 0,
}: {
  children: React.ReactNode;
  amplitude?: number;
  speed?: number;
  phase?: number;
}) {
  const reference = React.useRef<Group | null>(null);
  const baseY = React.useRef<number | null>(null);
  // Guard: no-op if not in a r3f render loop (tests/SSR)
  try {
    useFrame((state) => {
      if (!reference.current) return;
      const t = state.clock.getElapsedTime?.() ?? 0;
      const current = reference.current.position.y;
      if (baseY.current == undefined) baseY.current = current;
      const y = (baseY.current ?? 0) + amplitude * Math.sin((t + phase) * speed * 2 * Math.PI);
      reference.current!.position.y = y;
    });
  } catch {
    // ignore when useFrame is not available
  }
  return <group ref={reference as any}>{children}</group>;
}

export function phaseFromId(id?: string): number {
  if (!id) return 0;
  let h = 0;
  for (let index = 0; index < id.length; index++) h = (h * 31 + id.charCodeAt(index)) >>> 0;
  return (h % 1000) / 1000; // 0..1
}
