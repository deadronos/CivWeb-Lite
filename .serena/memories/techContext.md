## Technology Context

This project, CivWeb-Lite, is built with the following technologies:

*   **Framework:** React, TypeScript, Vite
*   **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
*   **State Management:** React Context (as per GEMINI.md)
*   **Styling:** CSS (as per GEMINI.md)
*   **Linting/Formatting:** ESLint, Prettier
*   **Testing:** Vitest, Playwright, @testing-library/react, @testing-library/jest-dom
*   **Other notable dependencies:** immer (for immutable state), ajv (JSON schema validation), react-icons, zod (schema declaration and validation).

The `vite.config.ts` shows a focus on build optimization with `ViteImageOptimizer` and manual chunking for `three`, `r3f`, and `react` libraries.