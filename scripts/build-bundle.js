#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

const modules = [
  'vars-anchor.css',
  'nav.css',
  'glass-surface.css',
  'cad-grid.css',
  'bg-nonlinear.css',
  'reveal.css',
  'wipe-heading.css',
  'button-eclipse.css'
];

const STOCKHOLM_TZ = 'Europe/Stockholm';

function formatNowStamp(prefix = '001') {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: STOCKHOLM_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const stamp = `${lookup.year}${lookup.month}${lookup.day}${lookup.hour}${lookup.minute}`;
  return `${prefix || ''}${stamp}`;
}

function validateStamp(stamp) {
  if (typeof stamp !== 'string') {
    return false;
  }

  if (/^\d{12}$/.test(stamp)) {
    return true;
  }

  if (/^\d{3}\d{12}$/.test(stamp)) {
    return true;
  }

  return false;
}

async function main() {
  let stampArg = process.argv[2];

  if (!stampArg || stampArg === 'auto') {
    const prefix = process.env.SQ_BUILD_PREFIX || '001';
    stampArg = formatNowStamp(prefix);
  }

  if (!validateStamp(stampArg)) {
    console.error('Build stamp must be 12 digits (YYYYMMDDHHMM) optionally prefixed with three digits.');
    process.exit(1);
  }

  const stamp = stampArg;
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
