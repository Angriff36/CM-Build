#!/usr/bin/env node
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envInfoPath = path.join(__dirname, 'env-info.json');

let cachedPackageJson;
let cachedPackageManager;
let cachedInvocation;

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function getPackageJson() {
  if (cachedPackageJson) {
    return cachedPackageJson;
  }
  cachedPackageJson = readJson(path.join(rootDir, 'package.json')) || {};
  return cachedPackageJson;
}

function detectProjectType() {
  if (fs.existsSync(path.join(rootDir, 'package.json'))) {
    return 'node';
  }
  if (
    fs.existsSync(path.join(rootDir, 'pyproject.toml')) ||
    fs.existsSync(path.join(rootDir, 'requirements.txt'))
  ) {
    return 'python';
  }
  return 'unknown';
}

function parsePackageManager() {
  if (cachedPackageManager) {
    return cachedPackageManager;
  }

  const pkg = getPackageJson();
  let name = null;
  let version = null;

  if (pkg.packageManager) {
    const [pmName, pmVersion] = pkg.packageManager.split('@');
    name = pmName || null;
    version = pmVersion || null;
  } else if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) {
    name = 'pnpm';
  } else if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
    name = 'npm';
  } else if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) {
    name = 'yarn';
  }

  if (!name) {
    name = 'npm';
  }

  cachedPackageManager = { name, version };
  return cachedPackageManager;
}

function commandExists(command) {
  try {
    if (process.platform === 'win32') {
      const check = spawnSync('cmd', ['/d', '/s', '/c', `${command} --version`], {
        stdio: 'ignore'
      });
      return check.status === 0;
    }
    const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
    return result.status === 0;
  } catch {
    return false;
  }
}

function getCommandVersion(command) {
  try {
    const result =
      process.platform === 'win32'
        ? spawnSync('cmd', ['/d', '/s', '/c', `${command} --version`], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore']
          })
        : spawnSync(command, ['--version'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore']
          });

    if (result.status !== 0) {
      return null;
    }

    return (result.stdout || '').trim();
  } catch {
    return null;
  }
}

function getPackageManagerInvocation() {
  if (cachedInvocation) {
    return cachedInvocation;
  }

  const pm = parsePackageManager();
  const pmRef = pm.version ? `${pm.name}@${pm.version}` : pm.name;
  const binaryAvailable = commandExists(pm.name);
  const versionMatches =
    !pm.version || (binaryAvailable && getCommandVersion(pm.name) === pm.version);

  if (binaryAvailable && versionMatches) {
    cachedInvocation = { command: pm.name, args: [] };
    return cachedInvocation;
  }

  if (commandExists('corepack')) {
    cachedInvocation = { command: 'corepack', args: [pmRef] };
    return cachedInvocation;
  }

  cachedInvocation = { command: 'npx', args: ['--yes', pmRef] };
  return cachedInvocation;
}

function runPackageManager(args, spawnOverrides = {}) {
  if (!Array.isArray(args)) {
    throw new Error('Package manager arguments must be provided as an array.');
  }

  const invocation = getPackageManagerInvocation();
  const spawnOptions = {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...spawnOverrides
  };

  const result = spawnSync(
    invocation.command,
    invocation.args.concat(args),
    spawnOptions
  );

  if (result.error) {
    throw result.error;
  }

  return result;
}

function hashFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  const hash = crypto.createHash('sha256');
  const fileBuffer = fs.readFileSync(filePath);
  hash.update(fileBuffer);
  return hash.digest('hex');
}

function resolveLockfile(pm) {
  const candidates = [];
  if (pm.name === 'pnpm') {
    candidates.push('pnpm-lock.yaml');
  } else if (pm.name === 'yarn') {
    candidates.push('yarn.lock');
  } else {
    candidates.push('package-lock.json');
  }
  candidates.push('pnpm-lock.yaml', 'package-lock.json', 'yarn.lock');

  for (const candidate of candidates) {
    const fullPath = path.join(rootDir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function shouldSyncNodeDependencies(lockFilePath, lockHash) {
  const envInfo = loadEnvInfo();
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  const lockRelative = lockFilePath ? path.relative(rootDir, lockFilePath) : null;

  if (!fs.existsSync(nodeModulesPath)) {
    return true;
  }

  if (!envInfo || envInfo.type !== 'node') {
    return true;
  }

  if ((envInfo.lockFile || null) !== lockRelative) {
    return true;
  }

  return (envInfo.lockHash || null) !== (lockHash || null);
}

function ensureNodeEnvironment() {
  const pm = parsePackageManager();
  const lockFilePath = resolveLockfile(pm);
  const lockHash = hashFile(lockFilePath);
  const needsSync = shouldSyncNodeDependencies(lockFilePath, lockHash);

  if (needsSync) {
    const installArgs = ['install'];
    if (pm.name === 'pnpm') {
      installArgs.push('--frozen-lockfile');
    }
    const installResult = runPackageManager(installArgs);

    if (installResult.status !== 0) {
      throw new Error(
        `Dependency installation failed with exit code ${installResult.status ?? 'unknown'}.`
      );
    }
  }

  return {
    type: 'node',
    lockFile: lockFilePath ? path.relative(rootDir, lockFilePath) : null,
    lockHash,
    executables: {
      binDir: path.join(rootDir, 'node_modules', '.bin')
    }
  };
}

function resolvePythonCommand() {
  if (commandExists('python3')) {
    return 'python3';
  }
  if (commandExists('python')) {
    return 'python';
  }
  if (process.platform === 'win32' && commandExists('py')) {
    return 'py';
  }
  throw new Error('No Python interpreter available on PATH.');
}

function detectRequirementsFile() {
  const candidates = ['requirements.txt', 'requirements-dev.txt', 'requirements/prod.txt'];
  for (const candidate of candidates) {
    const fullPath = path.join(rootDir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

function ensurePythonEnvironment() {
  const venvPath = path.join(rootDir, '.venv');
  const pythonCmd = resolvePythonCommand();
  const requirementsPath = detectRequirementsFile();
  const requirementsHash = hashFile(requirementsPath);
  const existingInfo = loadEnvInfo();

  let createdVenv = false;

  if (!fs.existsSync(venvPath)) {
    const create = spawnSync(pythonCmd, ['-m', 'venv', venvPath], {
      cwd: rootDir,
      stdio: 'inherit'
    });
    if (create.status !== 0) {
      throw new Error('Failed to create Python virtual environment.');
    }
    createdVenv = true;
  }

  const pythonBinary =
    process.platform === 'win32'
      ? path.join(venvPath, 'Scripts', 'python.exe')
      : path.join(venvPath, 'bin', 'python3');

  if (createdVenv) {
    const upgrade = spawnSync(
      pythonBinary,
      ['-m', 'pip', 'install', '--upgrade', 'pip', 'setuptools'],
      { cwd: rootDir, stdio: 'inherit' }
    );

    if (upgrade.status !== 0) {
      throw new Error('Failed to upgrade pip inside the virtual environment.');
    }
  }

  const depsChanged =
    createdVenv ||
    !existingInfo ||
    existingInfo.type !== 'python' ||
    (existingInfo.requirementsHash || null) !== (requirementsHash || null);

  if (requirementsPath && depsChanged) {
    const install = spawnSync(
      pythonBinary,
      ['-m', 'pip', 'install', '-r', requirementsPath],
      { cwd: rootDir, stdio: 'inherit' }
    );

    if (install.status !== 0) {
      throw new Error(
        `Failed to install Python dependencies from ${path.relative(rootDir, requirementsPath)}.`
      );
    }
  }

  return {
    type: 'python',
    venvPath,
    requirementsFile: requirementsPath ? path.relative(rootDir, requirementsPath) : null,
    requirementsHash,
    executables: {
      python: pythonBinary
    }
  };
}

function writeEnvInfo(info) {
  const payload = {
    ...info,
    packageManager: parsePackageManager(),
    timestamp: new Date().toISOString(),
    rootDir
  };
  fs.writeFileSync(envInfoPath, JSON.stringify(payload, null, 2));
}

function loadEnvInfo() {
  if (!fs.existsSync(envInfoPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(envInfoPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ensureEnvironment() {
  const projectType = detectProjectType();
  let info;

  if (projectType === 'node') {
    info = ensureNodeEnvironment();
  } else if (projectType === 'python') {
    info = ensurePythonEnvironment();
  } else {
    throw new Error(
      'Unsupported or unknown project type. Please ensure a manifest is present.'
    );
  }

  writeEnvInfo(info);
  return info;
}

if (require.main === module) {
  try {
    ensureEnvironment();
    console.log('Environment ready.');
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  ensureEnvironment,
  loadEnvInfo,
  detectProjectType,
  parsePackageManager,
  getPackageManagerInvocation,
  runPackageManager,
  rootDir,
  envInfoPath
};
