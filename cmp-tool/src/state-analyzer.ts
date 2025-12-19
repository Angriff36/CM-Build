import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'fast-glob';
import {
  ArchitecturalDecision,
  NegativeConstraint,
  ActivePlan,
  FilePath,
  ProjectState,
  CMPConfig
} from './types';

export class StateAnalyzer {
  private config: CMPConfig;
  private workspaceRoot: string;

  constructor(config: CMPConfig, workspaceRoot: string) {
    this.config = config;
    this.workspaceRoot = workspaceRoot;
  }

  async analyzeProject(): Promise<ProjectState> {
    const [
      architecturalDecisions,
      negativeConstraints,
      activePlans,
      activeFilePaths
    ] = await Promise.all([
      this.extractArchitecturalDecisions(),
      this.extractNegativeConstraints(),
      this.extractActivePlans(),
      this.extractActiveFilePaths()
    ]);

    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      architecturalDecisions,
      negativeConstraints,
      activePlans,
      activeFilePaths,
      metadata: {
        projectName: path.basename(this.workspaceRoot),
        workspaceRoot: this.workspaceRoot
      }
    };
  }

  private async extractArchitecturalDecisions(): Promise<ArchitecturalDecision[]> {
    const decisions: ArchitecturalDecision[] = [];

    // Analyze package.json files for technology decisions
    const packageJsonFiles = await glob('**/package.json', {
      cwd: this.workspaceRoot,
      ignore: this.config.excludePatterns
    });

    for (const file of packageJsonFiles) {
      try {
        const content = await fs.readFile(path.join(this.workspaceRoot, file), 'utf-8');
        const pkg = JSON.parse(content);

        // Extract framework/architecture decisions from dependencies
        if (pkg.dependencies) {
          const deps = Object.keys(pkg.dependencies);

          // React/Next.js decisions
          if (deps.includes('next')) {
            decisions.push({
              id: `next-framework-${file}`,
              description: 'Using Next.js framework for web application',
              reasoning: 'Next.js provides SSR, routing, and optimized React development',
              timestamp: new Date().toISOString(),
              category: 'technology',
              priority: 'high'
            });
          }

          // Database decisions
          if (deps.includes('@prisma/client')) {
            decisions.push({
              id: `prisma-orm-${file}`,
              description: 'Using Prisma as ORM for database operations',
              reasoning: 'Prisma provides type-safe database access and migrations',
              timestamp: new Date().toISOString(),
              category: 'technology',
              priority: 'high'
            });
          }

          // Database decisions
          if (deps.includes('@supabase/supabase-js')) {
            decisions.push({
              id: `supabase-database-${file}`,
              description: 'Using Supabase for backend-as-a-service and database',
              reasoning: 'Supabase provides PostgreSQL database, authentication, and real-time subscriptions',
              timestamp: new Date().toISOString(),
              category: 'technology',
              priority: 'high'
            });
          }

          // State management decisions
          if (deps.includes('@tanstack/react-query')) {
            decisions.push({
              id: `react-query-${file}`,
              description: 'Using React Query for server state management',
              reasoning: 'React Query provides powerful data synchronization and caching for server state',
              timestamp: new Date().toISOString(),
              category: 'architecture',
              priority: 'high'
            });
          }

          // Testing framework decisions
          if (deps.includes('vitest')) {
            decisions.push({
              id: `vitest-testing-${file}`,
              description: 'Using Vitest for fast unit testing',
              reasoning: 'Vitest provides fast, ESM-native testing with Jest-compatible API',
              timestamp: new Date().toISOString(),
              category: 'testing',
              priority: 'medium'
            });
          }

          if (deps.includes('@playwright/test')) {
            decisions.push({
              id: `playwright-testing-${file}`,
              description: 'Using Playwright for end-to-end testing',
              reasoning: 'Playwright provides cross-browser E2E testing with reliable automation',
              timestamp: new Date().toISOString(),
              category: 'testing',
              priority: 'medium'
            });
          }

          // UI library decisions
          if (deps.some(dep => dep.includes('@radix-ui'))) {
            decisions.push({
              id: `radix-ui-${file}`,
              description: 'Using Radix UI components for accessible UI primitives',
              reasoning: 'Radix provides unstyled, accessible components for consistent UX',
              timestamp: new Date().toISOString(),
              category: 'design',
              priority: 'medium'
            });
          }

          if (deps.includes('lucide-react')) {
            decisions.push({
              id: `lucide-icons-${file}`,
              description: 'Using Lucide React for consistent iconography',
              reasoning: 'Lucide provides beautiful, consistent icons with React components',
              timestamp: new Date().toISOString(),
              category: 'design',
              priority: 'low'
            });
          }

          // Build tool decisions
          if (deps.includes('turbo')) {
            decisions.push({
              id: `turbo-build-${file}`,
              description: 'Using Turbo for monorepo build orchestration',
              reasoning: 'Turbo provides fast, incremental builds and task orchestration for monorepos',
              timestamp: new Date().toISOString(),
              category: 'tooling',
              priority: 'high'
            });
          }

          // Observability decisions
          if (deps.some(dep => dep.includes('@opentelemetry'))) {
            decisions.push({
              id: `opentelemetry-observability-${file}`,
              description: 'Using OpenTelemetry for application observability',
              reasoning: 'OpenTelemetry provides standardized tracing, metrics, and logging',
              timestamp: new Date().toISOString(),
              category: 'infrastructure',
              priority: 'medium'
            });
          }
        }
      } catch (error) {
        // Skip malformed package.json files
        continue;
      }
    }

    // Analyze configuration files for architectural patterns
    const configFiles = await glob('**/*.{config,ts,js,json}', {
      cwd: this.workspaceRoot,
      ignore: [...this.config.excludePatterns, '**/node_modules/**']
    });

    for (const file of configFiles) {
      const content = await fs.readFile(path.join(this.workspaceRoot, file), 'utf-8');

      // Extract Tailwind CSS decisions
      if (content.includes('tailwindcss')) {
        decisions.push({
          id: `tailwind-styling-${file}`,
          description: 'Using Tailwind CSS for utility-first styling',
          reasoning: 'Tailwind provides consistent, responsive, and maintainable CSS classes',
          timestamp: new Date().toISOString(),
          category: 'design',
          priority: 'high'
        });
      }

      // Extract TypeScript configuration decisions
      if (file.includes('tsconfig') && content.includes('strict')) {
        decisions.push({
          id: `typescript-strict-${file}`,
          description: 'Enforcing strict TypeScript configuration',
          reasoning: 'Strict mode catches potential runtime errors at compile time',
          timestamp: new Date().toISOString(),
          category: 'technology',
          priority: 'high'
        });
      }

      // Extract monorepo patterns
      if (file.includes('pnpm-workspace.yaml') || file.includes('pnpm-workspace.yml')) {
        decisions.push({
          id: `pnpm-workspace-${file}`,
          description: 'Using pnpm workspaces for monorepo management',
          reasoning: 'pnpm workspaces provide efficient package management and dependency linking',
          timestamp: new Date().toISOString(),
          category: 'tooling',
          priority: 'high'
        });
      }

      // Extract Turbo configuration
      if (file.includes('turbo.json')) {
        decisions.push({
          id: `turbo-config-${file}`,
          description: 'Using Turbo for build orchestration and caching',
          reasoning: 'Turbo provides remote caching and parallel task execution for faster builds',
          timestamp: new Date().toISOString(),
          category: 'tooling',
          priority: 'high'
        });
      }

      // Extract Docker deployment patterns
      if (file.includes('Dockerfile') || file.includes('docker-compose')) {
        decisions.push({
          id: `docker-deployment-${file}`,
          description: 'Using Docker for containerized deployment',
          reasoning: 'Docker provides consistent deployment environments across different platforms',
          timestamp: new Date().toISOString(),
          category: 'infrastructure',
          priority: 'medium'
        });
      }

      // Extract Cloudflare Workers patterns
      if (content.includes('wrangler') || file.includes('wrangler.toml')) {
        decisions.push({
          id: `cloudflare-workers-${file}`,
          description: 'Using Cloudflare Workers for edge computing',
          reasoning: 'Cloudflare Workers provide serverless functions at the edge for low-latency responses',
          timestamp: new Date().toISOString(),
          category: 'infrastructure',
          priority: 'medium'
        });
      }

      // Extract Supabase configuration
      if (file.includes('supabase/config.toml')) {
        decisions.push({
          id: `supabase-config-${file}`,
          description: 'Using Supabase for backend infrastructure',
          reasoning: 'Supabase provides managed PostgreSQL, authentication, and real-time capabilities',
          timestamp: new Date().toISOString(),
          category: 'infrastructure',
          priority: 'high'
        });
      }
    }

    // Analyze project structure for architectural patterns
    const structuralDecisions = await this.extractStructuralDecisions();
    decisions.push(...structuralDecisions);

    return decisions;
  }

  private async extractStructuralDecisions(): Promise<ArchitecturalDecision[]> {
    const decisions: ArchitecturalDecision[] = [];

    // Check for monorepo structure
    const hasAppsDir = await fs.pathExists(path.join(this.workspaceRoot, 'apps'));
    const hasLibsDir = await fs.pathExists(path.join(this.workspaceRoot, 'libs'));
    const hasPackagesDir = await fs.pathExists(path.join(this.workspaceRoot, 'packages'));

    if (hasAppsDir && hasLibsDir) {
      decisions.push({
        id: 'monorepo-structure-apps-libs',
        description: 'Using monorepo structure with apps/ and libs/ directories',
        reasoning: 'Separating applications and shared libraries improves maintainability and reusability',
        timestamp: new Date().toISOString(),
        category: 'architecture',
        priority: 'high'
      });
    }

    // Check for testing structure
    const hasTestsDir = await fs.pathExists(path.join(this.workspaceRoot, '__tests__'));
    const hasTestE2eDir = await fs.pathExists(path.join(this.workspaceRoot, 'tests', 'e2e'));

    if (hasTestsDir && hasTestE2eDir) {
      decisions.push({
        id: 'comprehensive-testing-structure',
        description: 'Implementing comprehensive testing strategy with unit and E2E tests',
        reasoning: 'Multi-layer testing ensures code quality and prevents regressions',
        timestamp: new Date().toISOString(),
        category: 'testing',
        priority: 'medium'
      });
    }

    // Check for API structure
    const hasApiDir = await fs.pathExists(path.join(this.workspaceRoot, 'api'));
    const hasSupabaseFunctions = await fs.pathExists(path.join(this.workspaceRoot, 'supabase', 'functions'));

    if (hasApiDir && hasSupabaseFunctions) {
      decisions.push({
        id: 'hybrid-api-architecture',
        description: 'Using hybrid API architecture with REST endpoints and serverless functions',
        reasoning: 'Combining traditional REST APIs with serverless functions provides flexibility',
        timestamp: new Date().toISOString(),
        category: 'architecture',
        priority: 'medium'
      });
    }

    // Check for documentation structure
    const hasDocsDir = await fs.pathExists(path.join(this.workspaceRoot, 'docs'));
    const hasReadme = await fs.pathExists(path.join(this.workspaceRoot, 'README.md'));

    if (hasDocsDir && hasReadme) {
      decisions.push({
        id: 'comprehensive-documentation',
        description: 'Maintaining comprehensive documentation structure',
        reasoning: 'Good documentation improves developer experience and project maintainability',
        timestamp: new Date().toISOString(),
        category: 'process',
        priority: 'low'
      });
    }

    return decisions;
  }

  private async extractNegativeConstraints(): Promise<NegativeConstraint[]> {
    const constraints: NegativeConstraint[] = [];

    // Analyze source files for patterns that indicate constraints
    const sourceFiles = await glob('**/*.{ts,tsx,js,jsx}', {
      cwd: this.workspaceRoot,
      ignore: [...this.config.excludePatterns, '**/node_modules/**']
    });

    for (const file of sourceFiles) {
      const content = await fs.readFile(path.join(this.workspaceRoot, file), 'utf-8');

      // Check for patterns that indicate constraints
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Look for TODO comments that indicate known issues/constraints
        const todoMatch = line.match(/\/\/\s*TODO:\s*(.+)/i);
        if (todoMatch) {
          constraints.push({
            id: `todo-constraint-${file}-${i}`,
            description: `Known issue: ${todoMatch[1]}`,
            violation: 'TODO item indicates unresolved constraint',
            timestamp: new Date().toISOString(),
            severity: 'medium'
          });
        }

        // Look for FIXME comments
        const fixmeMatch = line.match(/\/\/\s*FIXME:\s*(.+)/i);
        if (fixmeMatch) {
          constraints.push({
            id: `fixme-constraint-${file}-${i}`,
            description: `Critical fix needed: ${fixmeMatch[1]}`,
            violation: 'FIXME indicates critical constraint violation',
            timestamp: new Date().toISOString(),
            severity: 'high'
          });
        }

        // Look for console.log statements (potential constraint on production code)
        if (line.includes('console.log') && !file.includes('.test.')) {
          constraints.push({
            id: `console-log-${file}-${i}`,
            description: 'Console.log statements found in production code',
            violation: 'Debug logging should not be present in production builds',
            timestamp: new Date().toISOString(),
            severity: 'low'
          });
        }
      }
    }

    // Analyze routing configurations
    const routingConstraints = await this.analyzeRoutingConfigurations();
    constraints.push(...routingConstraints);

    // Analyze unhooked features
    const unhookedConstraints = await this.analyzeUnhookedFeatures();
    constraints.push(...unhookedConstraints);

    return constraints;
  }

  private async extractActivePlans(): Promise<ActivePlan[]> {
    // For now, we'll create a placeholder plan based on the project structure
    // In a real implementation, this would analyze TODO files, project boards, or issue trackers
    const plans: ActivePlan[] = [];

    // Check if there are any TODO.md or similar files
    const todoFiles = await glob('**/TODO*.md', {
      cwd: this.workspaceRoot,
      ignore: this.config.excludePatterns
    });

    if (todoFiles.length > 0) {
      plans.push({
        id: 'project-todos',
        title: 'Project TODO Items',
        description: 'Outstanding tasks and improvements identified in project',
        steps: [], // Would be populated from actual TODO parsing
        status: 'active',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });
    }

    // Always include a development plan
    plans.push({
      id: 'development-plan',
      title: 'Active Development',
      description: 'Current development work and architectural decisions',
      steps: [
        {
          id: 'cmp-implementation',
          description: 'Implement Context Memory Protocol for state management',
          status: 'completed',
          dependencies: []
        }
      ],
      status: 'active',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    });

    return plans;
  }

  private async extractActiveFilePaths(): Promise<FilePath[]> {
    const filePaths: FilePath[] = [];

    const allFiles = await glob('**/*', {
      cwd: this.workspaceRoot,
      ignore: [...this.config.excludePatterns, '**/node_modules/**', '**/dist/**', '**/build/**'],
      stats: true
    });

    for (const file of allFiles) {
      if (typeof file === 'string') continue;

      const filePath = file.path;
      const fullPath = path.join(this.workspaceRoot, filePath);

      // Determine file type based on path and extension
      let type: FilePath['type'] = 'utility';
      if (filePath.includes('/components/') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        type = 'component';
      } else if (filePath.includes('config') || filePath.endsWith('.config.js') || filePath.endsWith('.config.ts')) {
        type = 'config';
      } else if (filePath.includes('/api/') || filePath.includes('/functions/')) {
        type = 'api';
      } else if (filePath.endsWith('.css') || filePath.endsWith('.scss') || filePath.includes('/styles/')) {
        type = 'style';
      } else if (filePath.includes('.test.') || filePath.includes('/__tests__/')) {
        type = 'test';
      }

      filePaths.push({
        path: filePath,
        type,
        lastModified: new Date(file.stats?.mtime || Date.now()).toISOString(),
        description: this.getFileDescription(filePath, type)
      });
    }

    return filePaths;
  }

  private async analyzeRoutingConfigurations(): Promise<NegativeConstraint[]> {
    const constraints: NegativeConstraint[] = [];

    // Check for Next.js app router vs pages router conflicts
    const hasPagesDir = await fs.pathExists(path.join(this.workspaceRoot, 'pages'));
    const hasAppDir = await fs.pathExists(path.join(this.workspaceRoot, 'app'));

    if (hasPagesDir && hasAppDir) {
      constraints.push({
        id: 'routing-mixed-app-pages',
        description: 'Mixed usage of Next.js pages/ and app/ directories detected',
        violation: 'Cannot use both pages router and app router simultaneously',
        timestamp: new Date().toISOString(),
        severity: 'critical'
      });
    }

    // Check for routing file naming inconsistencies
    const appFiles = await glob('apps/**/{page,layout,loading,error,not-found}.{ts,tsx,js,jsx}', {
      cwd: this.workspaceRoot,
      ignore: this.config.excludePatterns
    });

    for (const file of appFiles) {
      // Check if file uses correct extension (.tsx for TypeScript)
      if (file.endsWith('.js') && file.includes('/app/')) {
        constraints.push({
          id: `routing-extension-mismatch-${file}`,
          description: `JavaScript file in app router: ${file}`,
          violation: 'App router files should use .tsx extension for TypeScript',
          timestamp: new Date().toISOString(),
          severity: 'medium'
        });
      }
    }

    // Check for API route consistency
    const apiFiles = await glob('**/api/**/*.{ts,js}', {
      cwd: this.workspaceRoot,
      ignore: this.config.excludePatterns
    });

    for (const file of apiFiles) {
      // Check for common API route issues
      const content = await fs.readFile(path.join(this.workspaceRoot, file), 'utf-8');

      // Check for missing default export in API routes
      if (!content.includes('export default') && !content.includes('export async function')) {
        constraints.push({
          id: `api-route-missing-export-${file}`,
          description: `API route missing default export: ${file}`,
          violation: 'API routes must export a default function',
          timestamp: new Date().toISOString(),
          severity: 'high'
        });
      }

      // Check for potential route parameter issues
      const routeMatch = file.match(/api\/(.+)\.(ts|js)$/);
      if (routeMatch) {
        const routePath = routeMatch[1];
        if (routePath.includes('[') && !content.includes('params')) {
          constraints.push({
            id: `api-route-unused-params-${file}`,
            description: `API route with parameters not using params: ${file}`,
            violation: 'Dynamic API routes should destructure params from request',
            timestamp: new Date().toISOString(),
            severity: 'medium'
          });
        }
      }
    }

    return constraints;
  }

  private async analyzeUnhookedFeatures(): Promise<NegativeConstraint[]> {
    const constraints: NegativeConstraint[] = [];

    // Find all component files
    const componentFiles = await glob('**/*.{tsx,jsx}', {
      cwd: this.workspaceRoot,
      ignore: [...this.config.excludePatterns, '**/node_modules/**']
    });

    // Find all source files that might import components
    const sourceFiles = await glob('**/*.{ts,tsx,js,jsx}', {
      cwd: this.workspaceRoot,
      ignore: [...this.config.excludePatterns, '**/node_modules/**']
    });

    // Check for unimported components
    for (const componentFile of componentFiles) {
      if (componentFile.includes('/components/') || componentFile.includes('/ui/')) {
        const componentName = this.extractComponentName(componentFile);
        let isImported = false;

        // Check if this component is imported anywhere
        for (const sourceFile of sourceFiles) {
          if (sourceFile === componentFile) continue;

          const content = await fs.readFile(path.join(this.workspaceRoot, sourceFile), 'utf-8');
          if (content.includes(`import.*${componentName}`) || content.includes(`from.*${componentFile}`)) {
            isImported = true;
            break;
          }
        }

        if (!isImported) {
          constraints.push({
            id: `unhooked-component-${componentFile}`,
            description: `Unimported component: ${componentFile}`,
            violation: 'Component exists but is not imported anywhere in the codebase',
            timestamp: new Date().toISOString(),
            severity: 'medium'
          });
        }
      }
    }

    // Check for unused API routes
    const apiRoutes = await glob('**/api/**/*.{ts,js}', {
      cwd: this.workspaceRoot,
      ignore: this.config.excludePatterns
    });

    for (const apiRoute of apiRoutes) {
      let isCalled = false;
      const routePath = apiRoute.replace(/^.*\/api\//, '/api/').replace(/\.(ts|js)$/, '');

      // Check if this API route is called anywhere in the codebase
      for (const sourceFile of sourceFiles) {
        if (sourceFile.includes('/api/')) continue;

        const content = await fs.readFile(path.join(this.workspaceRoot, sourceFile), 'utf-8');
        if (content.includes(routePath) || content.includes(apiRoute.replace(/\.(ts|js)$/, ''))) {
          isCalled = true;
          break;
        }
      }

      if (!isCalled) {
        constraints.push({
          id: `unhooked-api-route-${apiRoute}`,
          description: `Unused API route: ${apiRoute}`,
          violation: 'API route exists but is not called anywhere in the frontend',
          timestamp: new Date().toISOString(),
          severity: 'low'
        });
      }
    }

    // Check for unused utility functions
    const libFiles = await glob('libs/**/src/**/*.{ts,js}', {
      cwd: this.workspaceRoot,
      ignore: this.config.excludePatterns
    });

    for (const libFile of libFiles) {
      const content = await fs.readFile(path.join(this.workspaceRoot, libFile), 'utf-8');
      const exports = this.extractExports(content);

      for (const exportName of exports) {
        let isUsed = false;

        for (const sourceFile of sourceFiles) {
          const sourceContent = await fs.readFile(path.join(this.workspaceRoot, sourceFile), 'utf-8');
          if (sourceContent.includes(exportName) && sourceContent.includes(libFile.replace(/\.(ts|js)$/, ''))) {
            isUsed = true;
            break;
          }
        }

        if (!isUsed) {
          constraints.push({
            id: `unhooked-utility-${libFile}-${exportName}`,
            description: `Unused export: ${exportName} in ${libFile}`,
            violation: 'Library export exists but is not used anywhere',
            timestamp: new Date().toISOString(),
            severity: 'low'
          });
        }
      }
    }

    // Check for unhooked Supabase functions
    const supabaseFunctions = await glob('supabase/functions/**/*.{ts,js}', {
      cwd: this.workspaceRoot,
      ignore: this.config.excludePatterns
    });

    for (const funcFile of supabaseFunctions) {
      let isCalled = false;

      for (const sourceFile of sourceFiles) {
        const content = await fs.readFile(path.join(this.workspaceRoot, sourceFile), 'utf-8');
        const functionName = this.extractFunctionName(funcFile);
        if (content.includes(functionName) || content.includes(funcFile)) {
          isCalled = true;
          break;
        }
      }

      if (!isCalled) {
        constraints.push({
          id: `unhooked-supabase-function-${funcFile}`,
          description: `Unused Supabase function: ${funcFile}`,
          violation: 'Supabase Edge function exists but is not invoked',
          timestamp: new Date().toISOString(),
          severity: 'low'
        });
      }
    }

    return constraints;
  }

  private extractComponentName(filePath: string): string {
    const fileName = filePath.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || '';
    return fileName.charAt(0).toUpperCase() + fileName.slice(1);
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportPatterns = [
      /export\s+(?:const|function|class|interface|type)\s+(\w+)/g,
      /export\s*{\s*([^}]+)\s*}/g,
      /export\s+default\s+(?:\w+\s+)?(\w+)/g
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          const names = match[1].split(',').map(name => name.trim().split(' ')[0]);
          exports.push(...names);
        }
      }
    }

    return [...new Set(exports)]; // Remove duplicates
  }

  private extractFunctionName(filePath: string): string {
    return filePath.split('/').pop()?.replace(/\.(ts|js)$/, '') || '';
  }

  private getFileDescription(filePath: string, type: FilePath['type']): string {
    switch (type) {
      case 'component':
        return 'UI component for the application';
      case 'config':
        return 'Configuration file for build tools or frameworks';
      case 'api':
        return 'API endpoint or serverless function';
      case 'style':
        return 'Styling and CSS definitions';
      case 'test':
        return 'Test file for unit or integration testing';
      default:
        return 'Utility or helper file';
    }
  }
}
