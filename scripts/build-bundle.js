#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

const modules = [
  'vars-anchor.css',
  'nav.css',
  'cad-grid.css',
  'bg-nonlinear.css',
  'reveal.css',
  'wipe-heading.css',
  'button-eclipse.css'
];

async function main() {
  const stamp = process.argv[2];

  if (!stamp) {
    console.error('Usage: node scripts/build-bundle.js <YYYYMMDDHHMM>');
    process.exit(1);
  }

  if (!/^\d{12}$/.test(stamp)) {
    console.error('Build stamp must match YYYYMMDDHHMM.');
    process.exit(1);
  }

  const bundleHeader = `/*! SweQuant bundle.css | build: ${stamp} */`;
  const buildToken = `:root { --sq-build: "${stamp}"; }`;

  const repoRoot = path.resolve(__dirname, '..');
  const packagesDir = path.join(repoRoot, 'packages');

  const sections = [bundleHeader, '', '/* build stamp */', buildToken, ''];

  for (const file of modules) {
    const filePath = path.join(packagesDir, file);
    const css = await fs.readFile(filePath, 'utf8');
    sections.push(`/* === ${file} === */`);
    sections.push(css.trimEnd());
    sections.push('');
  }

  const output = sections.join('\n').replace(/\n{3,}/g, '\n\n');
  const bundlePath = path.join(packagesDir, 'bundle.css');
  await fs.writeFile(bundlePath, output + '\n', 'utf8');
  console.log(`Wrote ${bundlePath} with build ${stamp}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
