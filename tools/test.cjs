#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
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

function resolvePythonExecutable() {
  const envInfo = installer.loadEnvInfo();
  if (envInfo?.executables?.python) {
    return envInfo.executables.python;
  }

  const venvPath = path.join(rootDir, '.venv');
  return process.platform === 'win32'
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python3');
}

function runNodeTests() {
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

function pythonModuleAvailable(pythonExecutable, moduleName) {
  const check = spawnSync(pythonExecutable, ['-m', moduleName, '--version'], {
    cwd: rootDir,
    stdio: 'ignore'
  });
  return check.status === 0;
}

function runPythonTests() {
  const pythonExecutable = resolvePythonExecutable();
  if (pythonModuleAvailable(pythonExecutable, 'pytest')) {
    const result = spawnSync(pythonExecutable, ['-m', 'pytest'], {
      cwd: rootDir,
      stdio: 'inherit'
    });

    if (result.status === 0) {
      return;
    }

    if (result.status !== null && result.status !== 5) {
      throw new Error(`Pytest failed with exit code ${result.status}.`);
    }
  }

  const result = spawnSync(pythonExecutable, ['-m', 'unittest', 'discover'], {
    cwd: rootDir,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    throw new Error(`Python unittest failed with exit code ${result.status ?? 'unknown'}.`);
  }
}

function runTests() {
  const projectType = installer.detectProjectType();
  if (projectType === 'python') {
    runPythonTests();
    return;
  }
  if (projectType === 'node') {
    runNodeTests();
    return;
  }
  throw new Error('Unsupported project type for test script.');
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
