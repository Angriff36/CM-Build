#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const installer = require('./install.cjs');

const rootDir = installer.rootDir || path.resolve(__dirname, '..');

function ensureInstall() {
  try {
    execSync('node tools/install.cjs', { stdio: 'ignore' });
  } catch (error) {
    throw new Error(`Environment provisioning failed: ${error.message}`);
  }
}

function ensureNodeLintTool() {
  const binName = process.platform === 'win32' ? 'eslint.cmd' : 'eslint';
  const eslintPath = path.join(rootDir, 'node_modules', '.bin', binName);
  if (fs.existsSync(eslintPath)) {
    return eslintPath;
  }

  const installResult = installer.runPackageManager(['add', '-D', 'eslint'], {
    stdio: ['ignore', 'ignore', 'inherit']
  });

  if (installResult.status !== 0) {
    throw new Error('Failed to install ESLint automatically.');
  }

  return eslintPath;
}

function formatLintMessage(filePath, msg) {
  const relativePath = filePath ? path.relative(rootDir, filePath) : '';
  const normalizedType = msg.fatal ? 'fatal' : 'error';
  const obj = msg.ruleId ? String(msg.ruleId) : '';
  return {
    type: normalizedType,
    path: relativePath,
    obj,
    message: msg.message || 'Lint error',
    line: String(msg.line ?? 0),
    column: String(msg.column ?? 0)
  };
}

function runNodeLint() {
  ensureNodeLintTool();
  const eslintResult = installer.runPackageManager(
    ['exec', 'eslint', '.', '--format', 'json'],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const rawOutput = eslintResult.stdout ? eslintResult.stdout.toString() : '[]';
  let parsed;

  try {
    parsed = JSON.parse(rawOutput || '[]');
  } catch (error) {
    throw new Error(`Failed to parse ESLint output: ${error.message}`);
  }

  const messages = [];

  parsed.forEach((fileReport) => {
    (fileReport.messages || []).forEach((msg) => {
      const severity = msg.fatal ? 2 : msg.severity;
      if (severity && severity >= 2) {
        messages.push(formatLintMessage(fileReport.filePath, msg));
      }
    });
  });

  return { messages, status: eslintResult.status ?? 0 };
}

function getPythonExecutable(envInfo) {
  if (envInfo?.executables?.python) {
    return envInfo.executables.python;
  }
  const venvPath = path.join(rootDir, '.venv');
  return process.platform === 'win32'
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python3');
}

function detectPythonLintTargets() {
  const candidates = ['src', 'app', 'api', 'backend'];
  const found = candidates.filter((dir) => fs.existsSync(path.join(rootDir, dir)));
  return found.length ? found : ['.'];
}

function ensurePythonLintTool(pythonExecutable) {
  const versionCheck = spawnSync(pythonExecutable, ['-m', 'pylint', '--version'], {
    cwd: rootDir,
    stdio: 'ignore'
  });

  if (versionCheck.status === 0) {
    return;
  }

  const result = spawnSync(
    pythonExecutable,
    ['-m', 'pip', 'install', '--upgrade', 'pylint'],
    { cwd: rootDir, stdio: ['ignore', 'ignore', 'inherit'] }
  );
  if (result.status !== 0) {
    throw new Error('Failed to install pylint.');
  }
}

function runPythonLint() {
  const envInfo = installer.loadEnvInfo();
  const pythonExecutable = getPythonExecutable(envInfo);
  ensurePythonLintTool(pythonExecutable);
  const targets = detectPythonLintTargets();

  const lintResult = spawnSync(
    pythonExecutable,
    ['-m', 'pylint', '--output-format=json'].concat(targets),
    { cwd: rootDir, stdio: ['ignore', 'pipe', 'pipe'] }
  );

  if (lintResult.error) {
    throw lintResult.error;
  }

  let parsed = [];
  try {
    const output = lintResult.stdout ? lintResult.stdout.toString() : '[]';
    parsed = JSON.parse(output || '[]');
  } catch (error) {
    throw new Error(`Failed to parse pylint output: ${error.message}`);
  }

  const allowedTypes = new Set(['fatal', 'error', 'warning']);
  const messages = [];
  parsed.forEach((entry) => {
    const normalizedType = (entry.type || 'error').toLowerCase();
    if (!allowedTypes.has(normalizedType)) {
      return;
    }
    messages.push({
      type: normalizedType,
      path: path.relative(rootDir, entry.path || ''),
      obj: entry.symbol ? String(entry.symbol) : '',
      message: entry.message || 'Lint error',
      line: String(entry.line ?? 0),
      column: String(entry.column ?? 0)
    });
  });

  return { messages, status: lintResult.status ?? 0 };
}

function main() {
  ensureInstall();
  const projectType = installer.detectProjectType();
  let result;

  if (projectType === 'python') {
    result = runPythonLint();
  } else if (projectType === 'node') {
    result = runNodeLint();
  } else {
    throw new Error('Unsupported project type for linting.');
  }

  const hasErrors = result.messages.length > 0;
  console.log(JSON.stringify(result.messages));
  process.exit(hasErrors ? 1 : 0);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    console.log('[]');
    process.exit(1);
  }
}
