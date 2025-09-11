// Runtime shims for react-three-fiber to avoid crashes when third-party code
// attempts to render unknown/incompatible primitives like <Polyline />.
//
// This registers a minimal placeholder so the reconciler can instantiate it
// instead of throwing "is not part of the THREE namespace". It’s a safe
// stopgap while we identify and replace the offending usage with supported
// Drei/three constructs (e.g. drei's <Line/> or <QuadraticBezierLine/>).

import { extend, ReactThreeFiber } from '@react-three/fiber';
import { Object3D } from 'three';

// Minimal stub that behaves like an empty Object3D in the scene graph.
class Polyline extends Object3D {}
class Svg extends Object3D {}

// Register the stub with R3F so <Polyline /> doesn’t crash the renderer.
// Some test environments partially mock `@react-three/fiber` and may not
// provide an `extend` export. Guard the call so importing this module in
// tests doesn't throw.
try {
  if (typeof extend === 'function') {
    extend({ Polyline, Svg });
  }
} catch {
  // Swallow errors — tests may provide a mock that doesn't include `extend`.
  // This is intentional: the shim is a runtime convenience and not required
  // for unit tests that mock rendering primitives.
}

// Typescript JSX intrinsic element declaration (kept narrow on purpose).
declare global {
  namespace JSX {
    // Allow usage of <Polyline /> without TS errors; it will map to Object3D.
    // Use a permissive `any` mapping to avoid depending on internal R3F types
    // which may not be present in test mocks.
    interface IntrinsicElements {
      Polyline: any;
      Svg: any;
    }
  }
}
