// Preview script for filename kebab-case codemod
// Usage: node scripts/preview-rename-files.js
// This script scans the `src/` directory and outputs a mapping of PascalCase filenames
// to kebab-case equivalents. It does NOT modify files — it's a safe preview.

const fs = require('node:fs');
const path = require('node:path');

function toKebab(name) {
  // preserve extension
  const extension = path.extname(name);
  const base = path.basename(name, extension);
  // If already kebab-case (contains -) or all lower, return null
  if (base.includes('-') || base === base.toLowerCase()) return null;
  // Convert PascalCase or camelCase to kebab-case
  const kebab = base
    .replaceAll(/([\da-z])([A-Z])/g, '$1-$2')
    .replaceAll(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
  return kebab + extension;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip node_modules and .git and .codemod
      if (['node_modules', '.git', '.codemod'].includes(e.name)) continue;
      files.push(...walk(full));
    } else if (e.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function main() {
  const root = path.join(__dirname, '..');
  const source = path.join(root, 'src');
  if (!fs.existsSync(source)) {
    console.error('src/ not found. Run this from repo root.');
    process.exit(1);
  }
  const all = walk(source);
  const mapping = [];
  for (const f of all) {
    const rel = path.relative(root, f).replaceAll('\\', '/');
    const name = path.basename(f);
    const kebab = toKebab(name);
    if (kebab) {
      mapping.push({ from: rel, to: path.join(path.dirname(rel), kebab).replaceAll('\\', '/') });
    }
  }
  const outDir = path.join(root, '.codemod');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, 'preview-renames.json');
  fs.writeFileSync(outFile, JSON.stringify(mapping, null, 2));
  console.log('Preview mapping written to .codemod/preview-renames.json');
  console.log('Total candidates:', mapping.length);
  if (mapping.length > 0) {
    console.log('\nSample:');
    console.log(mapping.slice(0, 10));
  }
}

main();
