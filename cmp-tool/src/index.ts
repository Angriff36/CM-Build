import { StateAnalyzer } from './state-analyzer';
import { XMLSerializer } from './xml-serializer';
import type {
  ArchitecturalDecision,
  NegativeConstraint,
  ActivePlan,
  PlanStep,
  FilePath,
  ProjectState,
  CMPConfig
} from './types';

// Export types
export type {
  ArchitecturalDecision,
  NegativeConstraint,
  ActivePlan,
  PlanStep,
  FilePath,
  ProjectState,
  CMPConfig
};

// Export classes
export { StateAnalyzer } from './state-analyzer';
export { XMLSerializer } from './xml-serializer';

// Main CMP class for programmatic usage
export class CMP {
  private analyzer: StateAnalyzer;
  private serializer: XMLSerializer;

  constructor(config: CMPConfig, workspaceRoot: string) {
    this.analyzer = new StateAnalyzer(config, workspaceRoot);
    this.serializer = new XMLSerializer();
  }

  async freezeState(): Promise<string> {
    const state = await this.analyzer.analyzeProject();
    return this.serializer.serialize(state);
  }

  generateSystemPrompt(stateXml: string): string {
    return this.serializer.generateSystemPrompt(stateXml);
  }

  loadState(xmlContent: string): ProjectState {
    return this.serializer.deserialize(xmlContent);
  }
}
