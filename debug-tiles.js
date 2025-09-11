// Quick debug script to examine tile generation and coordinate mapping
import { generateWorld } from './src/game/world/generate.js';
import { axialToWorld } from './src/scene/utils/coords.js';

const { tiles } = generateWorld('debug-seed', 10, 8); // Small map for debugging

console.log('=== TILE ANALYSIS ===');
console.log(`Generated ${tiles.length} tiles for 10x8 map`);
console.log('Expected:', 10 * 8);

// Check if all positions are covered
const positionMap = new Map();
for (const tile of tiles) {
  const key = `${tile.coord.q},${tile.coord.r}`;
  positionMap.set(key, tile);
}

console.log('\n=== POSITION COVERAGE ===');
for (let r = 0; r < 8; r++) {
  const row = [];
  for (let q = 0; q < 10; q++) {
    const key = `${q},${r}`;
    const tile = positionMap.get(key);
    if (tile) {
      row.push(tile.biome.substring(0, 1).toUpperCase()); // First letter of biome
    } else {
      row.push('?'); // Missing tile
    }
  }
  console.log(`Row ${r}: ${row.join(' ')}`);
}

console.log('\n=== WORLD COORDINATES ===');
console.log('Sample coordinate mappings:');
for (let r = 0; r < 3; r++) {
  for (let q = 0; q < 5; q++) {
    const [x, z] = axialToWorld(q, r, 0.5);
    const tile = positionMap.get(`${q},${r}`);
    console.log(`(${q},${r}) -> world(${x.toFixed(2)}, ${z.toFixed(2)}) biome: ${tile?.biome || 'missing'}`);
  }
}

console.log('\n=== BIOME DISTRIBUTION ===');
const biomeCount = {};
for (const tile of tiles) {
  biomeCount[tile.biome] = (biomeCount[tile.biome] || 0) + 1;
}
console.log(biomeCount);