// Simple coordinate analysis using browser console debugging
// To add this to the scene component for runtime debugging

const coordinateAnalysis = {
  analyzeMap: (state) => {
    const tiles = state.map.tiles;
    console.log('=== COORDINATE ANALYSIS ===');
    console.log(`Total tiles: ${tiles.length}`);
    console.log(`Expected: ${state.map.width * state.map.height}`);

    // Check position coverage
    const positionMap = new Map();
    for (const tile of tiles) {
      const key = `${tile.coord.q},${tile.coord.r}`;
      positionMap.set(key, tile);
    }

    let missingPositions = [];
    for (let r = 0; r < state.map.height; r++) {
      for (let q = 0; q < state.map.width; q++) {
        const key = `${q},${r}`;
        if (!positionMap.has(key)) {
          missingPositions.push({ q, r });
        }
      }
    }

    console.log(`Missing positions: ${missingPositions.length}`);
    if (missingPositions.length > 0) {
      console.log('First 10 missing:', missingPositions.slice(0, 10));
    }

    // Check biome distribution
    const biomeCount = {};
    for (const tile of tiles) {
      biomeCount[tile.biome] = (biomeCount[tile.biome] || 0) + 1;
    }
    console.log('Biome distribution:', biomeCount);

    return { positionMap, missingPositions, biomeCount };
  },

  testCoordinateMapping: (width = 10, height = 8) => {
    console.log('=== COORDINATE MAPPING TEST ===');
    const axialToWorld = (q, r, size = 0.5) => {
      const worldX = size * (3 / 2) * q;
      const worldZ = size * Math.sqrt(3) * (r + 0.5 * (q & 1));
      return [worldX, worldZ];
    };

    for (let r = 0; r < height; r++) {
      const row = [];
      for (let q = 0; q < width; q++) {
        const [x, z] = axialToWorld(q, r);
        row.push(`(${x.toFixed(1)},${z.toFixed(1)})`);
      }
      console.log(`Row ${r}:`, row.join(' | '));
    }
  },
};

// Export for manual browser testing
if (typeof window !== 'undefined') {
  window.coordinateAnalysis = coordinateAnalysis;
}

export default coordinateAnalysis;
