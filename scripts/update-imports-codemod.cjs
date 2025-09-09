#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const previewPath = path.resolve(__dirname, '..', '.codemod', 'preview-renames.json');
if (!fs.existsSync(previewPath)) {
  console.error('preview-renames.json not found at', previewPath);
  process.exit(1);
}

const mappings = JSON.parse(fs.readFileSync(previewPath, 'utf8'));

// Create map from normalized old import path (relative to repo root) to new path
const repoRoot = path.resolve(__dirname, '..');
const map = new Map();
for (const m of mappings) {
  const from = path.resolve(repoRoot, m.from).replace(/\\\\/g, '/');
  const to = path.resolve(repoRoot, m.to).replace(/\\\\/g, '/');
  map.set(from, to);
}

function listFiles(dir) {
  const res = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === 'node_modules' || name.name === '.git' || name.name === '.codemod') continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      res.push(...listFiles(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(name.name)) {
      res.push(full);
    }
  }
  return res;
}

function resolveImportAbsolute(fromFile, importSource) {
  // Only handle relative imports (./ or ../)
  if (!importSource.startsWith('.')) return null;
  const importerDir = path.dirname(fromFile);
  const abs = path.resolve(importerDir, importSource);
  // Try with extensions .tsx .ts .jsx .js and index files
  const candidates = [];
  for (const ext of ['.tsx', '.ts', '.jsx', '.js']) candidates.push(abs + ext);
  for (const ext of ['.tsx', '.ts', '.jsx', '.js']) candidates.push(path.join(abs, 'index' + ext));
  for (const c of candidates) {
    const norm = c.replace(/\\\\/g, '/');
    if (map.has(norm)) return map.get(norm);
  }
  // Also check if abs itself maps (maybe original import had extension)
  const normAbs = abs.replace(/\\\\/g, '/');
  if (map.has(normAbs)) return map.get(normAbs);
  return null;
}

let changedFiles = [];
const files = listFiles(repoRoot);
for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  } catch (e) {
    console.error('Parse failed for', file, e.message);
    continue;
  }

  let fileChanged = false;
  traverse(ast, {
    ImportDeclaration(pathNode) {
      const src = pathNode.node.source.value;
      const resolved = resolveImportAbsolute(file, src);
      if (!resolved) return;
      // Compute new relative path from importer to resolved new file
      const importerDir = path.dirname(file);
      // prefer extensionless path; compute relative
      let rel = path.relative(importerDir, resolved).replace(/\\\\/g, '/');
      if (!rel.startsWith('.')) rel = './' + rel;
      // remove extensions and trailing /index
      rel = rel.replace(/(index)?(\.tsx?|\.jsx?|\.ts|\.js)$/i, '');
      // ensure leading ./ for same-dir
      if (rel === '') rel = './';

      // Update the import source
      pathNode.node.source.value = rel;
      fileChanged = true;
    }
  });

  if (fileChanged) {
    const out = generate(ast, { retainLines: true }, code).code;
    fs.writeFileSync(file, out, 'utf8');
    changedFiles.push(path.relative(repoRoot, file));
  }
}

console.log('Updated imports in files:', changedFiles.length);
for (const f of changedFiles) console.log(' -', f);
process.exit(0);
