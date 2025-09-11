# Drei Migration Plan — CivWeb‑Lite

## Goal

Migrate and standardize the project's Three.js / @react-three/fiber scene code to use @react-three/drei primitives where they provide clear value. Keep changes incremental, testable, and reversible. Make the scene modular and easy to extend for future visual improvements.

## Principles

- Small, safe steps: change one component or one subsystem at a time.
- Keep UI behavior and tests stable: add mocks and guards where Drei introduces DOM/WebGL-only APIs.
- Make new code composable: export small, focused components (CameraControls, Model, Label, InstancedTiles).
- Make it opt-in: keep old implementations during transition and add a `useDrei` feature-flag if needed.

## Phases & Tasks

Phase 0 — Audit (non-invasive)

- Read `src/scene/Scene.tsx` and any child components under `src/scene/*`.
- Identify candidates for Drei: controls, labels/tooltips, model loading, instancing, stats.
- Produce a short mapping: file -> recommended Drei replacement.

Phase 1 — Infrastructure & Dev Helpers

- Add or verify `@react-three/drei` in `package.json` (already present in this repo).
- Create small helper components under `src/scene/drei/`:
  - `CameraControls.tsx` — wraps `<OrbitControls />` with props for enable/disable, damping, min/max distances, and keyboard shortcuts.
  - `DevStats.tsx` — dev-only `<Stats />` wrapper that only renders in development builds.
  - `HtmlLabel.tsx` — thin wrapper around `<Html>` to standardize style and accessibility.
  - `GLTFModel.tsx` — tiny wrapper around `useGLTF()` with built-in cache and fallback placeholder.
  - `BillboardLabel.tsx` — wrapper around `<Billboard>` and `<Text>` for unit labels.
- Add Vitest mocks for Drei components in test setup (see "Testing" below).

Phase 2 — Controls & Dev tools (low risk)

- Replace existing camera/control logic with `CameraControls` in `Scene.tsx`.
- Add `DevStats` into the scene tree behind a dev-only flag.
- Run tests and smoke-run the dev server.

Phase 3 — Labels, tooltips, small UI (low-medium risk)

- Replace DOM-positioned unit/tile labels/tooltips with `HtmlLabel` for one sample component (e.g., unit preview or hovered tile tooltip).
- Replace simple billboard icons with `BillboardLabel`.
- Add unit tests for label render behavior and vitest mocks ensure stable tests.

Phase 4 — Model loading (medium risk)

- Identify components that load GLTF models (units, buildings). Replace loader code with `GLTFModel` and `useGLTF`.
- Add ErrorBoundary for models and show a small placeholder mesh when model load fails.

Phase 5 — Instancing (higher risk, big performance gains)

- Identify heavily repeated geometry (tiles, trees, simple props).
- Implement instanced meshes using either r3f's `instancedMesh` or `Instances` approach.
- Validate visually and benchmark FPS with `DevStats`.

Phase 6 — Cleanup & iterate

- Remove old code paths incrementally once new components are stable.
- Add documentation to `docs/` describing patterns for artists/devs (GLTF naming conventions, LOD, texture sizes).

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
