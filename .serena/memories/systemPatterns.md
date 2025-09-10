# System Patterns

**Architecture:**
- Modular src/ structure: components, contexts, game logic, scene, utils
- Game state managed via React context provider (GameProvider)
- Scene composition handled by @react-three/fiber in src/scene
- UI and HUD separated from WebGL logic

**Key Technical Decisions:**
- Use TypeScript for strict typing
- Prefer functional components and hooks
- Keep Three.js logic isolated from DOM/UI

**Design Patterns in Use:**
- Context API for state
- Custom hooks for input and camera controls
- Component composition for scene objects

**Component Relationships:**
- App.tsx wires together provider, scene, and UI
- GameProvider exposes useGame() for consumers
