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

function detectPythonEntryPoint() {
  const candidates = [
    'main.py',
    'app.py',
    path.join('src', 'main.py'),
    path.join('backend', 'main.py'),
    path.join('api', 'main.py')
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(rootDir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  throw new Error('Unable to locate a Python entry point (expected main.py or app.py).');
}

function runNodeApplication() {
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

function runPythonApplication() {
  const pythonExecutable = resolvePythonExecutable();
  const entryPoint = detectPythonEntryPoint();

  execFileSync(pythonExecutable, [entryPoint], { cwd: rootDir, stdio: 'inherit' });
}

function runApplication() {
  const projectType = installer.detectProjectType();
  if (projectType === 'python') {
    runPythonApplication();
    return;
  }
  if (projectType === 'node') {
    runNodeApplication();
    return;
  }
  throw new Error('Unsupported project type for run script.');
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
