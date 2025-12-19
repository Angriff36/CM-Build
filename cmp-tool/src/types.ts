export interface ArchitecturalDecision {
  id: string;
  description: string;
  reasoning: string;
  timestamp: string;
  category: 'architecture' | 'technology' | 'design' | 'constraint' | 'testing' | 'tooling' | 'infrastructure' | 'process';
  priority: 'high' | 'medium' | 'low';
}

export interface NegativeConstraint {
  id: string;
  description: string;
  violation: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ActivePlan {
  id: string;
  title: string;
  description: string;
  steps: PlanStep[];
  status: 'active' | 'completed' | 'paused';
  created: string;
  updated: string;
}

export interface PlanStep {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dependencies?: string[];
}

export interface FilePath {
  path: string;
  type: 'component' | 'config' | 'utility' | 'api' | 'style' | 'test';
  lastModified: string;
  description?: string;
}

export interface ProjectState {
  timestamp: string;
  version: string;
  architecturalDecisions: ArchitecturalDecision[];
  negativeConstraints: NegativeConstraint[];
  activePlans: ActivePlan[];
  activeFilePaths: FilePath[];
  metadata: {
    projectName: string;
    workspaceRoot: string;
    sessionId?: string;
  };
}

export interface CMPConfig {
  outputDir: string;
  compressionLevel: 'minimal' | 'standard' | 'detailed';
  includePatterns: string[];
  excludePatterns: string[];
  maxFileSize: number;
  autoSave: boolean;
}
