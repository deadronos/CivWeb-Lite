import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Enforce kebab-case filenames for all source files under src/ except an allowlist
// kept in ESLint overrides. This test provides an early signal in CI and local dev.

const SRC_DIR = path.join(process.cwd(), 'src');

// Mirror the temporary allowlist from eslint.config.cjs. Reduce over time.
const LEGACY_ALLOWLIST = new Set([
  'App.tsx',
  'components/common/LazySpinner.tsx',
  'components/overhaul/LeftCivicPanel.tsx',
  // removed in favor of kebab-case implementations
  'components/ui/ContextPanel.tsx',
  'components/ui/Icon.tsx',
  'components/ui/Minimap.tsx',
  // LeftPanel, container and TopBar shims removed — canonical kebab-case files are used
  // removed PascalCase shim entries: GameHUD, UnitSelectionOverlayContainer
  'contexts/HoverContext.tsx',
  // GameProvider and SelectionContext shims removed; canonical kebab-case context files are used
  'game/tech/tech-catalog.ts',
  'hooks/useCamera.tsx',
  'hooks/useGame.ts',
  'scene/InstancedTiles.tsx',
  'scene/Scene.tsx',
  'scene/TileMesh.tsx',
  'scene/UnitMarkers.tsx',
  'scene/UnitMeshes.tsx',
  'scene/drei/BillboardLabel.tsx',
  'scene/drei/CameraControls.tsx',
  'scene/drei/DevStats.tsx',
  'scene/drei/GLTFModel.tsx',
  'scene/drei/HtmlLabel.tsx',
  'scene/units/Bob.tsx',
  'scene/units/gltfRegistry.ts',
  'scene/units/modelRegistry.tsx',
  'scene/units/ProceduralPreload.tsx',
  // Additional legacy shims still present; keep in allowlist until they're removed/renamed
  // LeftPanel, MinimapContainer, NextTurnControlContainer, TopBar, TopBarContainer shims removed in safe batches — canonical kebab-case files are used
  // TopBar, TopBarContainer, SelectionContext shims removed in safe batch
  // TopBar, TopBarContainer, SelectionContext shims removed in safe batch
  // GameProvider, SelectionContext, HoverContext PascalCase shims have been untracked; keep kebab-case files
]);

function isKebabCase(name: string) {
  // accept dot-separated suffixes; only check the base file name
  // Kebab-case: lowercase letters, digits, and hyphens
  const base = path.basename(name);
  return /^[\da-z]+(?:-[\da-z]+)*\.[a-z]+$/.test(base);
}

function listFiles(root: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) results.push(...listFiles(full));
    else results.push(full);
  }
  return results;
}

describe('kebab-case filenames under src/', () => {
  const files = listFiles(SRC_DIR).map((f) => path.relative(SRC_DIR, f).replaceAll('/', '/'));
  const offenders = files.filter((relativePath) => {
    if (LEGACY_ALLOWLIST.has(relativePath)) return false;
    const base = path.basename(relativePath);
    // allow non-code assets freely (e.g., .json, .md, .css already kebab).
    if (!/\.(ts|tsx|js|jsx)$/.test(base)) return false;
    return !isKebabCase(base);
  });

  it('has no non-kebab filenames (outside allowlist)', () => {
    expect(offenders, `Rename these files to kebab-case or add to allowlist temporarily`).toEqual(
      []
    );
  });
});
