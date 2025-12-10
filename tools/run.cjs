#!/usr/bin/env node
const { execSync, execFileSync } = require('child_process');
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
      throw new Error('package.json not found. Cannot determine how to run the project.');
    }
    throw error;
  }
}

function pickRunScript(pkg) {
  const scripts = pkg.scripts || {};
  const priorities = ['start', 'dev', 'serve'];
  for (const script of priorities) {
    if (scripts[script]) {
      return script;
    }
  }
  return null;
}

function ensureInstall() {
  execSync('node tools/install.cjs', { stdio: 'inherit' });
}

function runApplication() {
  const pkg = readPackageJson();
  const scriptName = pickRunScript(pkg);

  if (scriptName) {
    const result = installer.runPackageManager(['run', scriptName]);
    if (result.status !== 0) {
      throw new Error(
        `Project script "${scriptName}" failed with exit code ${result.status ?? 'unknown'}.`
      );
    }
    return;
  }

  if (pkg.main) {
    const entryFile = path.join(rootDir, pkg.main);
    execFileSync('node', [entryFile], { stdio: 'inherit', cwd: rootDir });
    return;
  }

  throw new Error('No runnable script or entry point found in package.json.');
}

function main() {
  ensureInstall();
  runApplication();
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
  runApplication,
  ensureInstall
};
