# Drei Migration Plan — CivWeb‑Lite

## Goal

Migrate and standardize the project's Three.js / @react-three/fiber scene code to use @react-three/drei primitives where they provide clear value. Keep changes incremental, testable, and reversible. Make the scene modular and easy to extend for future visual improvements.

## Principles

- Small, safe steps: change one component or one subsystem at a time.
- Keep UI behavior and tests stable: add mocks and guards where Drei introduces DOM/WebGL-only APIs.
- Make new code composable: export small, focused components (CameraControls, Model, Label, InstancedTiles).
- Make it opt-in: keep old implementations during transition and add a `useDrei` feature-flag if needed.

## Phases & Tasks

Note: As of this update the repository already contains the Drei helper wrappers and the Scene imports them. The list below marks what is done, in-progress, and remaining.

Phase 0 — Audit (non-invasive) ✅ Done

- Read `src/scene/Scene.tsx` and any child components under `src/scene/*`. (Done — `src/scene/scene.tsx` and children reviewed.)
- Identify candidates for Drei: controls, labels/tooltips, model loading, instancing, stats. (Done.)
- Produce a short mapping: file -> recommended Drei replacement. (Done inline — see Files to create / edit section updated below.)

Phase 1 — Infrastructure & Dev Helpers ✅ Done

- Add or verify `@react-three/drei` in `package.json`. (Verified — dependency present: `@react-three/drei` at ^10.7.5.)
- Create small helper components under `src/scene/drei/`:
  - `CameraControls.tsx` — implemented at `src/scene/drei/camera-controls.tsx` (custom camera controller).
  - `DevStats.tsx` — implemented at `src/scene/drei/dev-stats.tsx` (dev-only Stats wrapper).
  - `HtmlLabel.tsx` — implemented at `src/scene/drei/html-label.tsx` (Html wrapper with DOM prop sanitization).
  - `GLTFModel.tsx` — implemented at `src/scene/drei/gltf-model.tsx` (useGLTF wrapper + test-friendly fallback).
  - `BillboardLabel.tsx` — implemented at `src/scene/drei/billboard-label.tsx` (Billboard + Text wrapper).
- Add Vitest mocks for Drei components in test setup (see "Testing" below). (Partially addressed: the repo uses `src/scene/fiber-shims.ts` to stub some R3F types and Drei wrappers include runtime guards. Tests reference `scene/drei/*` in ESLint config; consider adding an explicit `vitest.setup.ts` if you prefer centralized Jest-style mocks.)

Phase 2 — Controls & Dev tools (low risk) ✅ Done (controls) / Optional (DevStats placement)

- Replace existing camera/control logic with `CameraControls` in `Scene.tsx`. (Done — `scene.tsx` imports and uses `CameraControls`.)
- Add `DevStats` into the scene tree behind a dev-only flag. (DevStats component exists; not automatically mounted in `scene.tsx`. You can opt-in by adding it to the App or Scene under a NODE_ENV/dev flag.)
- Run tests and smoke-run the dev server. (Not run as part of this doc update — recommended next step after further changes.)

Phase 3 — Labels, tooltips, small UI (low-medium risk) ✅ Done

- Replace DOM-positioned unit/tile labels/tooltips with `HtmlLabel` for one sample component (e.g., unit preview or hovered tile tooltip). (Done — `scene.tsx` uses `HtmlLabel` for hovered tile and selected unit labels.)
- Replace simple billboard icons with `BillboardLabel`. (Wrapper implemented; usage can be adopted where text billboards are required.)
- Add unit tests for label render behavior and vitest mocks ensure stable tests. (Some tests reference Drei wrappers; consider adding focused tests if you add behavior.)

Phase 4 — Model loading (medium risk) ✅ Done (wrapper) / Integration recommended

- Identify components that load GLTF models (units, buildings). Replace loader code with `GLTFModel` and `useGLTF`. (Wrapper `gltf-model.tsx` exists and `model-registry.tsx` / `gltf-registry.ts` handle assets — verify per-model usage when migrating specific unit models.)
- Add ErrorBoundary for models and show a small placeholder mesh when model load fails. (The `GLTFModel` component already provides a test-friendly fallback when `window` is undefined; consider adding an ErrorBoundary around dynamic model mounts for runtime resilience.)

Phase 5 — Instancing (higher risk, big performance gains) ✅ Partially done

- Identify heavily repeated geometry (tiles, trees, simple props). (Done — `instanced-models.tsx` and `unit-meshes.tsx` handle instancing.)
- Implement instanced meshes using either r3f's `instancedMesh` or `Instances` approach. (Implemented in `src/scene/instanced-models.tsx`.)
- Validate visually and benchmark FPS with `DevStats`. (DevStats available for benchmarking; consider adding in-scene when running manual perf tests.)

Phase 6 — Cleanup & iterate (ongoing)

- Remove old code paths incrementally once new components are stable. (Deferred — keep for careful PRs.)
- Add documentation to `docs/` describing patterns for artists/devs (GLTF naming conventions, LOD, texture sizes). (Suggested follow-up.)

## Files to create / edit (examples)

- New: `src/scene/drei/CameraControls.tsx`
- New: `src/scene/drei/DevStats.tsx`
- New: `src/scene/drei/HtmlLabel.tsx`
- New: `src/scene/drei/GLTFModel.tsx`
- New: `src/scene/drei/BillboardLabel.tsx`
- Edit: `src/scene/Scene.tsx` to import and use `CameraControls` and `DevStats`
- Edit: `src/scene/components/*` where labels/models are used to consume the new wrappers
- Edit: `vitest.setup.ts` (or create if missing) to mock Drei in tests

## Example component snippets (conceptual)

CameraControls.tsx

```tsx
import React from 'react';
import { OrbitControls } from '@react-three/drei';

export default function CameraControls(props) {
  return <OrbitControls enablePan enableRotate enableZoom {...props} />;
}
```

HtmlLabel.tsx

```tsx
import React from 'react';
import { Html } from '@react-three/drei';

export default function HtmlLabel({ children, position, ...rest }) {
  return (
    <Html position={position} center {...rest}>
      <div className="label">{children}</div>
    </Html>
  );
}
```

## Testing guidance

- Vitest runs in a jsdom environment; r3f/drei require browser/WebGL APIs. Two minimal approaches:
  1. Mock Drei components in `tests/setup.ts` or `vitest.setup.ts`:
     - Example:

       ```js
       // vitest.setup.ts
       import React from 'react';
       jest.mock('@react-three/drei', () => ({
         OrbitControls: () => null,
         Html: ({ children }) => React.createElement('div', {}, children),
         Stats: () => null,
         useGLTF: () => ({ nodes: {}, materials: {} }),
         Billboard: ({ children }) => React.createElement('div', {}, children),
       }));
       ```

  2. Keep Drei usage only in client code, and dynamically import Drei-using components behind lazy boundaries and guard with simple 'isBrowser' checks in tests.

## Rollback & safety

- Keep old implementation files until the new three/drei wrappers are battle-tested.
- Merge Drei refactors in small PRs with screenshots and the perf numbers.

## Acceptance criteria

- Scene renders correctly in dev after each phase.
- Vitest suite remains green (with mocks in place) or updated tests if behavior intentionally changed.
- Code organized under `src/scene/drei/` and `src/scene/components/` with small, composable wrappers.

## Follow-up suggestions

- Add a small `README.md` under `src/scene/` documenting Drei patterns and how to add new models/labels.
- Consider adding a performance test harness (`scripts/benchWorld.ts`) to capture FPS before/after instancing.

---

If you want I can implement Phase 1 (create the helper wrappers and add Vitest mocks) and run the test suite. Which phase should I start implementing? If Phase 1, I'll:

- create the helper components in `src/scene/drei/`,
- add a `vitest.setup.ts` mock file (or augment existing setup), and
- update `src/scene/Scene.tsx` to use `CameraControls` and `DevStats` behind a dev flag, then run `npm test` and report results.
