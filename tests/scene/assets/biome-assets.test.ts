import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadBiomeVariants } from 'src/scene/assets/biome-assets.ts';

// Mock the deep dependencies from three.js to prevent network calls and isolate the test
const mockMesh = {
  isMesh: true,
  name: 'tile_mesh',
  geometry: {
    clone: () => ({ applyMatrix4: vi.fn(), groups: [] }),
    index: { array: [0, 1, 2, 3, 4, 5], count: 6 },
    attributes: { position: { count: 4 } },
  },
  material: { clone: vi.fn(() => ({ isMaterial: true })) },
  updateWorldMatrix: vi.fn(),
  matrixWorld: { isMatrix4: true },
};

const mockScene = {
  isScene: true,
  traverse: vi.fn((callback) => {
    callback(mockMesh);
  }),
};

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: vi.fn(() => ({
    load: vi.fn((_url, onLoad) => onLoad({ scene: mockScene })),
  })),
}));

vi.mock('three/examples/jsm/utils/BufferGeometryUtils.js', () => ({
  mergeGeometries: vi.fn(() => ({
    isBufferGeometry: true,
    computeVertexNormals: vi.fn(),
    attributes: {},
  })),
}));

// Mock the registry to prevent side-effects and inspect calls if needed
vi.mock('src/scene/assets/biome-variants-registry', () => ({
  setVariantAssets: vi.fn(),
}));

describe('loadBiomeVariants', () => {
  let consoleWarnSpy: vi.SpyInstance;

  beforeEach(() => {
    // Spy on console.warn to check for logged errors
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Define window to bypass the SSR guard in the function
    (globalThis as any).window = {};
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    delete (globalThis as any).window;
    vi.clearAllMocks();
  });

  it('should complete without logging a TypeError', async () => {
    // With the bug present, getBiomeAssetPath throws a TypeError, which is caught
    // and logged to console.warn by loadBiomeVariants.
    await loadBiomeVariants('grass');

    // Filter the calls to console.warn to find any that included a TypeError.
    const typeErrorWarnings = consoleWarnSpy.mock.calls.filter(
      (callArgs) => callArgs[3] instanceof TypeError
    );

    // This assertion will FAIL with the buggy code because typeErrorWarnings.length will be 3.
    // It will PASS with the fixed code because the length will be 0.
    expect(typeErrorWarnings).toHaveLength(0);
  });
});
