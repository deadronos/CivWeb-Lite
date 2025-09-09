const fs = require('fs');
const path = require('path');

const previewPath = path.resolve(__dirname, '..', '.codemod', 'preview-renames.json');
if (!fs.existsSync(previewPath)) {
  console.error('preview-renames.json not found');
  process.exit(1);
}

const mappings = JSON.parse(fs.readFileSync(previewPath, 'utf8'));

// Build simple mapping from old without extension to new without extension
const map = mappings.reduce((acc, m) => {
  const from = m.from.replace(/\\.tsx?$|\\.ts$/, '');
  const to = m.to.replace(/\\.tsx?$|\\.ts$/, '');
  acc[from] = to;
  return acc;
}, {});

// Files to scan
function listFiles(dir) {
  const res = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (it.name === 'node_modules' || it.name === '.git') continue;
      res.push(...listFiles(full));
    } else if (/\\.(ts|tsx|js|jsx|md|json)$/.test(it.name)) {
      res.push(full);
    }
  }
  return res;
}

const root = path.resolve(__dirname, '..');
const files = listFiles(root);

let changes = 0;
for (const file of files) {
  let txt = fs.readFileSync(file, 'utf8');
  let orig = txt;
  for (const from in map) {
    const to = map[from];
    // Replace occurrences like 'src/contexts/GameProvider' or "/src/contexts/GameProvider"
    const re = new RegExp(from.replace(/\\//g, '\\/'), 'g');
    if (re.test(txt)) {
      txt = txt.replace(re, to);
    }
  }
  if (txt !== orig) {
    fs.writeFileSync(file, txt, 'utf8');
    changes++;
    console.log('Updated', path.relative(root, file));
  }
}

console.log('Done. Files changed:', changes);
