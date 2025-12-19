#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import { StateAnalyzer } from './state-analyzer';
import { XMLSerializer } from './xml-serializer';
import { CMPConfig } from './types';

const program = new Command();

program
  .name('cmp')
  .description('Context Memory Protocol - State Freezing for AI Agent Development')
  .version('0.1.0');

program
  .command('save')
  .description('Freeze current project state into XML format')
  .option('-o, --output <file>', 'Output file path', 'state.xml')
  .option('-c, --config <file>', 'Config file path', 'cmp.config.json')
  .option('--compression <level>', 'Compression level (minimal|standard|detailed)', 'standard')
  .action(async (options) => {
    try {
      console.log('🔍 Analyzing project state...');

      const workspaceRoot = process.cwd();
      const config = await loadConfig(options.config, workspaceRoot);

      const analyzer = new StateAnalyzer(config, workspaceRoot);
      const state = await analyzer.analyzeProject();

      console.log('📦 Serializing state...');

      const serializer = new XMLSerializer();
      const xmlState = serializer.serialize(state);

      const outputPath = path.resolve(options.output);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, xmlState, 'utf-8');

      console.log(`✅ State frozen and saved to: ${outputPath}`);
      console.log(`📊 Extracted ${state.architecturalDecisions.length} decisions, ${state.negativeConstraints.length} constraints, ${state.activePlans.length} plans`);

      // Generate system prompt for easy copying
      const systemPrompt = serializer.generateSystemPrompt(xmlState);
      const promptPath = path.resolve(path.dirname(outputPath), 'system-prompt.txt');
      await fs.writeFile(promptPath, systemPrompt, 'utf-8');

      console.log(`📋 System prompt saved to: ${promptPath}`);
      console.log('\n💡 Copy the system prompt content and paste it into your next chat session');

    } catch (error) {
      console.error('❌ Error freezing state:', error);
      process.exit(1);
    }
  });

program
  .command('load')
  .description('Load and display frozen project state')
  .option('-i, --input <file>', 'Input state file path', 'state.xml')
  .action(async (options) => {
    try {
      const inputPath = path.resolve(options.input);

      if (!await fs.pathExists(inputPath)) {
        console.error(`❌ State file not found: ${inputPath}`);
        process.exit(1);
      }

      const xmlContent = await fs.readFile(inputPath, 'utf-8');
      const serializer = new XMLSerializer();

      console.log('🔄 Loading frozen state...');
      console.log('📋 System prompt for new session:');
      console.log('=' .repeat(50));

      const systemPrompt = serializer.generateSystemPrompt(xmlContent);
      console.log(systemPrompt);

      console.log('=' .repeat(50));
      console.log('\n💡 Copy the prompt above and use it as your system prompt in a fresh chat session');

    } catch (error) {
      console.error('❌ Error loading state:', error);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze current project without saving state')
  .option('-c, --config <file>', 'Config file path', 'cmp.config.json')
  .action(async (options) => {
    try {
      console.log('🔍 Analyzing current project state...');

      const workspaceRoot = process.cwd();
      const config = await loadConfig(options.config, workspaceRoot);

      const analyzer = new StateAnalyzer(config, workspaceRoot);
      const state = await analyzer.analyzeProject();

      console.log('\n📊 ANALYSIS RESULTS:');
      console.log('=' .repeat(50));

      console.log(`🏗️  Architectural Decisions: ${state.architecturalDecisions.length}`);
      state.architecturalDecisions.forEach(decision => {
        console.log(`  • ${decision.category.toUpperCase()}: ${decision.description}`);
      });

      console.log(`\n🚫 Negative Constraints: ${state.negativeConstraints.length}`);
      state.negativeConstraints.forEach(constraint => {
        console.log(`  • ${constraint.severity.toUpperCase()}: ${constraint.description}`);
      });

      console.log(`\n📋 Active Plans: ${state.activePlans.length}`);
      state.activePlans.forEach(plan => {
        console.log(`  • ${plan.title} (${plan.status})`);
        plan.steps.forEach(step => {
          console.log(`    - ${step.description} [${step.status}]`);
        });
      });

      console.log(`\n📁 Active Files: ${state.activeFilePaths.length}`);
      const fileTypes = state.activeFilePaths.reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(fileTypes).forEach(([type, count]) => {
        console.log(`  • ${type}: ${count} files`);
      });

    } catch (error) {
      console.error('❌ Error analyzing project:', error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Create default CMP configuration file')
  .option('-f, --force', 'Overwrite existing config file')
  .action(async (options) => {
    try {
      const configPath = path.resolve('cmp.config.json');

      if (await fs.pathExists(configPath) && !options.force) {
        console.error(`❌ Config file already exists: ${configPath}`);
        console.log('💡 Use --force to overwrite');
        process.exit(1);
      }

      const defaultConfig: CMPConfig = {
        outputDir: './.cmp',
        compressionLevel: 'standard',
        includePatterns: ['**/*.{ts,tsx,js,jsx,json,md}'],
        excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        maxFileSize: 1024 * 1024, // 1MB
        autoSave: false
      };

      await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
      console.log(`✅ Created default config: ${configPath}`);

    } catch (error) {
      console.error('❌ Error creating config:', error);
      process.exit(1);
    }
  });

async function loadConfig(configPath: string, workspaceRoot: string): Promise<CMPConfig> {
  const fullConfigPath = path.resolve(configPath);

  if (await fs.pathExists(fullConfigPath)) {
    return await fs.readJson(fullConfigPath);
  }

  // Return default config if no config file exists
  return {
    outputDir: './.cmp',
    compressionLevel: 'standard',
    includePatterns: ['**/*.{ts,tsx,js,jsx,json,md}'],
    excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
    maxFileSize: 1024 * 1024,
    autoSave: false
  };
}

program.parse();
