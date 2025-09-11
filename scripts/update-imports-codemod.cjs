#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const previewPath = path.resolve(__dirname, '..', '.codemod', 'preview-renames.json');
if (!fs.existsSync(previewPath)) {
  console.error('preview-renames.json not found at', previewPath);
  process.exit(1);
}

const mappings = JSON.parse(fs.readFileSync(previewPath));

// Create map from normalized old import path (relative to repo root) to new path
const repoRoot = path.resolve(__dirname, '..');
const map = new Map();
for (const m of mappings) {
  const from = path.resolve(repoRoot, m.from).replaceAll('\\\\', '/');
  const to = path.resolve(repoRoot, m.to).replaceAll('\\\\', '/');
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
  for (const extension of ['.tsx', '.ts', '.jsx', '.js']) candidates.push(abs + extension);
  for (const extension of ['.tsx', '.ts', '.jsx', '.js']) candidates.push(path.join(abs, 'index' + extension));
  for (const c of candidates) {
    const norm = c.replaceAll('\\\\', '/');
    if (map.has(norm)) return map.get(norm);
  }
  // Also check if abs itself maps (maybe original import had extension)
  const normAbs = abs.replaceAll('\\\\', '/');
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
  } catch (error) {
    console.error('Parse failed for', file, error.message);
    continue;
  }

  let fileChanged = false;
  traverse(ast, {
    ImportDeclaration(pathNode) {
      const source = pathNode.node.source.value;
      const resolved = resolveImportAbsolute(file, source);
      if (!resolved) return;
      // Compute new relative path from importer to resolved new file
      const importerDir = path.dirname(file);
      // prefer extensionless path; compute relative
      let rel = path.relative(importerDir, resolved).replaceAll('\\\\', '/');
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
