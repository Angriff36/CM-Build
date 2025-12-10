#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const installer = require('./install.cjs');

const rootDir = installer.rootDir || path.resolve(__dirname, '..');

function readPackageJson() {
  try {
    const raw = fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('package.json not found. Cannot determine how to run tests.');
    }
    throw error;
  }
}

function ensureInstall() {
  execSync('node tools/install.cjs', { stdio: 'inherit' });
}

function runTests() {
  const pkg = readPackageJson();
  const scripts = pkg.scripts || {};

  if (scripts.test) {
    const result = installer.runPackageManager(['run', 'test']);
    if (result.status !== 0) {
      throw new Error(`Test script failed with exit code ${result.status ?? 'unknown'}.`);
    }
    return;
  }

  throw new Error('No test script defined in package.json.');
}

function main() {
  ensureInstall();
  runTests();
}

if (require.main === module) {
  try {
    main();
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  runTests,
  ensureInstall
};
