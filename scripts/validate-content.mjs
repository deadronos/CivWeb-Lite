#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const dataDir = path.join(root, 'src', 'data');

function readJson(file) {
  const p = path.join(dataDir, file);
  const txt = fs.readFileSync(p);
  return JSON.parse(txt);
}

function validateDAG(nodes) {
  const graph = Object.fromEntries(nodes.map(n => [n.id, n.prerequisites || []]));
  const visited = new Set();
  const stack = new Set();
  function dfs(id) {
    if (stack.has(id)) throw new Error(`Cycle at ${id}`);
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    for (const dep of graph[id] || []) dfs(dep);
    stack.delete(id);
  }
  for (const id of Object.keys(graph)) dfs(id);
}

function main() {
  const techs = readJson('techs.json');
  const units = readJson('units.json');
  const buildings = readJson('buildings.json');
  const improvements = readJson('improvements.json');
  const civics = fs.existsSync(path.join(dataDir, 'civics.json')) ? readJson('civics.json') : [];

  const errors = [];
  const warnings = [];

  // DAG
  try { validateDAG(techs); } catch (error) { errors.push(String(error.message || error)); }

  const techIds = new Set(techs.map(t => t.id));
  const techUnlocks = {
    units: new Set(),
    buildings: new Set(),
    improvements: new Set(),
  };
  const unitIds = new Set(units.map(u => u.id));
  const buildingIds = new Set(buildings.map(b => b.id));
  const improvementIds = new Set(improvements.map(index => index.id));
  const civicIds = new Set(civics.map(c => c.id));

  // Units requires/upgrade_to
  for (const u of units) {
    if (u.requires && !techIds.has(u.requires)) warnings.push(`Unit ${u.id} requires unknown tech ${u.requires}`);
    if (u.upgrade_to && !unitIds.has(u.upgrade_to)) warnings.push(`Unit ${u.id} upgrade_to unknown unit ${u.upgrade_to}`);
  }

  // Buildings requires
  for (const b of buildings) {
    if (b.requires && !techIds.has(b.requires) && !civicIds.has(b.requires)) warnings.push(`Building ${b.id} requires unknown tech/civic ${b.requires}`);
  }

  // Tech unlocks reference checks and collect coverage
  for (const t of techs) {
    const u = t.unlocks || {};
    for (const id of u.units || []) {
      if (!unitIds.has(id)) warnings.push(`Tech ${t.id} unlocks unknown unit ${id}`);
      techUnlocks.units.add(id);
    }
    for (const id of u.buildings || []) {
      if (!buildingIds.has(id)) warnings.push(`Tech ${t.id} unlocks unknown building ${id}`);
      techUnlocks.buildings.add(id);
    }
    for (const id of u.improvements || []) {
      if (!improvementIds.has(id)) warnings.push(`Tech ${t.id} unlocks unknown improvement ${id}`);
      techUnlocks.improvements.add(id);
    }
  }

  // Civic unlocks coverage
  for (const c of civics) {
    const u = c.unlocks || {};
    for (const id of u.units || []) {
      if (!unitIds.has(id)) warnings.push(`Civic ${c.id} unlocks unknown unit ${id}`);
      techUnlocks.units.add(id);
    }
    for (const id of u.buildings || []) {
      if (!buildingIds.has(id)) warnings.push(`Civic ${c.id} unlocks unknown building ${id}`);
      techUnlocks.buildings.add(id);
    }
    for (const id of u.improvements || []) {
      if (!improvementIds.has(id)) warnings.push(`Civic ${c.id} unlocks unknown improvement ${id}`);
      techUnlocks.improvements.add(id);
    }
  }

  // Orphaned definitions: require something but never unlocked anywhere
  for (const u of units) {
    if (u.requires && !techUnlocks.units.has(u.id)) warnings.push(`Unit ${u.id} has requires=${u.requires} but is not unlocked by any tech`);
  }
  for (const b of buildings) {
    if (b.requires && !techUnlocks.buildings.has(b.id)) warnings.push(`Building ${b.id} has requires=${b.requires} but is not unlocked by any tech/civic`);
  }
  for (const index of improvements) {
    if (!techUnlocks.improvements.has(index.id)) warnings.push(`Improvement ${index.id} is not unlocked by any tech`);
  }

  // Output
  if (errors.length > 0) {
    console.error('Errors:');
    for (const e of errors) console.error(' -', e);
  }
  if (warnings.length > 0) {
    console.warn('Warnings:');
    for (const w of warnings) console.warn(' -', w);
  }
  if (errors.length > 0) process.exit(1);
  console.log('Content validation OK:', { techs: techs.length, units: units.length, buildings: buildings.length, improvements: improvements.length, unlocked: { units: techUnlocks.units.size, buildings: techUnlocks.buildings.size, improvements: techUnlocks.improvements.size } });
}

main();
