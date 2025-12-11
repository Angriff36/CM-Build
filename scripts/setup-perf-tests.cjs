#!/usr/bin/env node

/**
 * Performance Testing Setup Script
 * Installs and configures k6 for load testing the heuristics and task board
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up performance testing environment...');

// Check if k6 is installed
function checkK6() {
  try {
    execSync('k6 version', { stdio: 'pipe' });
    console.log('✅ k6 is already installed');
    return true;
  } catch (error) {
    console.log('❌ k6 is not installed');
    return false;
  }
}

// Install k6 based on platform
function installK6() {
  const platform = process.platform;
  
  try {
    if (platform === 'win32') {
      console.log('📦 Installing k6 on Windows...');
      // Download and install k6 on Windows
      execSync('powershell -Command "Invoke-WebRequest -Uri https://dl.k6.io/windows/k6-latest-amd64.msi -OutFile k6-installer.msi; Start-Process msiexec.exe -ArgumentList \'/i k6-installer.msi /quiet\' -Wait; Remove-Item k6-installer.msi"', { stdio: 'inherit' });
    } else if (platform === 'darwin') {
      console.log('📦 Installing k6 on macOS...');
      execSync('brew install k6', { stdio: 'inherit' });
    } else if (platform === 'linux') {
      console.log('📦 Installing k6 on Linux...');
      execSync('sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver keyserver.ubuntu.com --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69', { stdio: 'inherit' });
      execSync('echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list', { stdio: 'inherit' });
      execSync('sudo apt-get update && sudo apt-get install k6', { stdio: 'inherit' });
    }
    
    console.log('✅ k6 installed successfully');
  } catch (error) {
    console.error('❌ Failed to install k6:', error.message);
    console.log('📖 Please install k6 manually: https://k6.io/docs/getting-started/installation/');
    process.exit(1);
  }
}

// Create environment file template
function createEnvTemplate() {
  const envTemplate = `# Performance Testing Environment Variables
# Copy this file to .env.test and fill in your values

# Supabase Configuration
BASE_URL=https://your-project.supabase.co/functions/v1
AUTH_TOKEN=your-service-role-key

# Test Configuration
K6_VUS=20
K6_DURATION=10m
K6_ITERATIONS=100

# Monitoring
ENABLE_METRICS=true
METRICS_EXPORT=prometheus
`;
  
  const envPath = path.join(__dirname, '..', '..', '.env.test.template');
  fs.writeFileSync(envPath, envTemplate);
  console.log('📝 Created environment template at .env.test.template');
}

// Create performance test runner script
function createTestRunner() {
  const runnerScript = `#!/bin/bash

# Performance Test Runner
# Usage: ./run-perf-tests.sh [baseline|peak|burst]

set -e

TEST_TYPE=${1:-baseline}
ENV_FILE=".env.test"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found"
    echo "📝 Copy .env.test.template to $ENV_FILE and fill in your values"
    exit 1
fi

# Load environment variables
source "$ENV_FILE"

echo "🚀 Running $TEST_TYPE performance test..."

case $TEST_TYPE in
  "baseline")
    echo "📊 Baseline load: 20 VUs for 10 minutes"
    k6 run --vus 20 --duration 10m tests/perf/heuristics.k6.js
    ;;
  "peak")
    echo "⚡ Peak load: 50 VUs for 5 minutes"
    k6 run --vus 50 --duration 5m tests/perf/heuristics.k6.js
    ;;
  "burst")
    echo "💥 Burst testing: 30 VUs with rapid calls"
    k6 run --vus 30 --duration 3m tests/perf/heuristics.k6.js
    ;;
  *)
    echo "❌ Unknown test type: $TEST_TYPE"
    echo "📖 Available types: baseline, peak, burst"
    exit 1
    ;;
esac

echo "✅ Performance test completed"
echo "📊 Check the results and compare against benchmarks in tests/perf/board.benchmark.md"
`;
  
  const runnerPath = path.join(__dirname, '..', '..', 'scripts', 'run-perf-tests.sh');
  fs.writeFileSync(runnerPath, runnerScript);
  
  // Make it executable on Unix systems
  if (process.platform !== 'win32') {
    fs.chmodSync(runnerPath, '755');
  }
  
  console.log('📝 Created performance test runner at scripts/run-perf-tests.sh');
}

// Main execution
async function main() {
  console.log('🔍 Checking k6 installation...');
  
  if (!checkK6()) {
    console.log('📦 Installing k6...');
    installK6();
  }
  
  console.log('📝 Creating configuration files...');
  createEnvTemplate();
  createTestRunner();
  
  console.log('✅ Performance testing setup complete!');
  console.log('');
  console.log('📖 Next steps:');
  console.log('1. Copy .env.test.template to .env.test and configure your Supabase credentials');
  console.log('2. Run baseline test: ./scripts/run-perf-tests.sh baseline');
  console.log('3. Check results against benchmarks in tests/perf/board.benchmark.md');
  console.log('4. Run peak and burst tests for comprehensive validation');
  console.log('');
  console.log('📊 For detailed results and analysis, see:');
  console.log('   - tests/perf/board.benchmark.md');
  console.log('   - docs/operations/engineering_playbook.md');
}

main().catch(console.error);