import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const distDir = path.resolve(process.cwd(), 'dist');
const manifestPath = path.join(distDir, '.vite', 'manifest.json');
const budgetKiB = Number.parseInt(process.env.LOGIN_BUNDLE_BUDGET_KB || '550', 10);

if (!fs.existsSync(manifestPath)) {
  throw new Error('Vite manifest missing. Run npm run build:prod before this check.');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entryKeys = Object.entries(manifest).filter(([, value]) => value.isEntry).map(([key]) => key);
const loginKeys = Object.entries(manifest)
  .filter(([key, value]) => /(^|\/)Login\.jsx$/.test(key) || /(^|\/)Login-[^/]+\.js$/.test(value.file))
  .map(([key]) => key);

if (entryKeys.length === 0 || loginKeys.length === 0) {
  throw new Error(`Unable to resolve application/login entries (entry=${entryKeys.length}, login=${loginKeys.length}).`);
}

const visited = new Set();
const files = new Set();
function visit(key) {
  if (visited.has(key)) return;
  visited.add(key);
  const item = manifest[key];
  if (!item) throw new Error(`Manifest import not found: ${key}`);
  files.add(item.file);
  for (const css of item.css || []) files.add(css);
  for (const imported of item.imports || []) visit(imported);
}
for (const key of [...entryKeys, ...loginKeys]) visit(key);

let gzipBytes = 0;
const rows = [];
for (const file of [...files].sort()) {
  const contents = fs.readFileSync(path.join(distDir, file));
  const compressed = zlib.gzipSync(contents, { level: 9 }).length;
  gzipBytes += compressed;
  rows.push({ file, rawKiB: contents.length / 1024, gzipKiB: compressed / 1024 });
}
for (const row of rows) console.log(`${row.file}: ${row.rawKiB.toFixed(1)} KiB raw, ${row.gzipKiB.toFixed(1)} KiB gzip`);

const totalKiB = gzipBytes / 1024;
console.log(`Login route total: ${totalKiB.toFixed(1)} KiB gzip; budget: ${budgetKiB} KiB`);
if (totalKiB > budgetKiB) {
  throw new Error(`Login route bundle budget exceeded by ${(totalKiB - budgetKiB).toFixed(1)} KiB`);
}
