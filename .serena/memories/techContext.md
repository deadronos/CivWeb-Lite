## Technology Context

This project, CivWeb-Lite, is built with the following technologies:

*   **Framework:** React, TypeScript, Vite
*   **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
*   **State Management:** React Context (as per GEMINI.md)
*   **Styling:** CSS (as per GEMINI.md)
*   **Linting/Formatting:** ESLint, Prettier
*   **Testing:** Vitest, Playwright, @testing-library/react, @testing-library/jest-dom
*   **Other notable dependencies:** immer (for immutable state), ajv (JSON schema validation), react-icons, zod (schema declaration and validation).

Additional notes:

- The `vite.config.ts` uses `vite-plugin-image-optimizer` (exported as `ViteImageOptimizer`) and defines `manualChunks` for `three`, `r3f`, and `react` to keep large libs in separate bundles.
- AJV is lazily required in `src/game/save/validator.ts` to avoid evaluation side-effects during module import.
- Zod schemas for runtime action validation live under `schema/action.schema.ts` and are used by the `GameProvider` validation pipeline.
