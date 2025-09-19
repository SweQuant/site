#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

const { resolveStamp } = require('./build-stamp');

const modules = [
  'wipe-heading.js',
  'reveal-controller.js',
  'nav-entrance.js',
  'nav-active-link.js',
  'cad-grid.js'
];

async function main() {
  let stamp;
  try {
    stamp = resolveStamp(process.argv[2]);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
    return;
  }

  const bundleHeader = `/*! SweQuant footer-bundle.js | build: ${stamp} */`;

  const repoRoot = path.resolve(__dirname, '..');
  const packagesDir = path.join(repoRoot, 'packages');

  const sections = [bundleHeader, ''];

  for (const file of modules) {
    const filePath = path.join(packagesDir, file);
    const js = await fs.readFile(filePath, 'utf8');
    sections.push(`// === ${file} ===`);
    sections.push(js.trimEnd());
    sections.push('');
  }

  const output = sections.join('\n').replace(/\n{3,}/g, '\n\n');
  const wrappedOutput = ['<script>', output, '</script>'].join('\n');
  const bundlePath = path.join(packagesDir, 'footer-bundle.js');
  await fs.writeFile(bundlePath, `${wrappedOutput}\n`, 'utf8');
  console.log(`Wrote ${bundlePath} with build ${stamp}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
