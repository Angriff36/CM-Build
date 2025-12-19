import { ProjectState } from './types';

export class XMLSerializer {
  serialize(state: ProjectState): string {
    const xmlParts: string[] = [];

    xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlParts.push('<cmp-state version="1.0">');

    // Metadata
    xmlParts.push('  <metadata>');
    xmlParts.push(`    <project>${this.escapeXml(state.metadata.projectName)}</project>`);
    xmlParts.push(`    <workspace>${this.escapeXml(state.metadata.workspaceRoot)}</workspace>`);
    xmlParts.push(`    <timestamp>${state.timestamp}</timestamp>`);
    xmlParts.push(`    <session-id>${state.metadata.sessionId || 'unknown'}</session-id>`);
    xmlParts.push('  </metadata>');

    // Architectural Decisions (High Priority Only)
    const highPriorityDecisions = state.architecturalDecisions.filter(d => d.priority === 'high');
    if (highPriorityDecisions.length > 0) {
      xmlParts.push('  <axioms>');
      for (const decision of highPriorityDecisions) {
        xmlParts.push('    <axiom>');
        xmlParts.push(`      <id>${decision.id}</id>`);
        xmlParts.push(`      <desc>${this.escapeXml(decision.description)}</desc>`);
        xmlParts.push(`      <reason>${this.escapeXml(decision.reasoning)}</reason>`);
        xmlParts.push(`      <category>${decision.category}</category>`);
        xmlParts.push('    </axiom>');
      }
      xmlParts.push('  </axioms>');
    }

    // Negative Constraints (Critical and High Severity Only)
    const criticalConstraints = state.negativeConstraints.filter(
      c => c.severity === 'critical' || c.severity === 'high'
    );
    if (criticalConstraints.length > 0) {
      xmlParts.push('  <constraints>');
      for (const constraint of criticalConstraints) {
        xmlParts.push('    <constraint>');
        xmlParts.push(`      <id>${constraint.id}</id>`);
        xmlParts.push(`      <desc>${this.escapeXml(constraint.description)}</desc>`);
        xmlParts.push(`      <violation>${this.escapeXml(constraint.violation)}</violation>`);
        xmlParts.push(`      <severity>${constraint.severity}</severity>`);
        xmlParts.push('    </constraint>');
      }
      xmlParts.push('  </constraints>');
    }

    // Active Plans
    if (state.activePlans.length > 0) {
      xmlParts.push('  <plans>');
      for (const plan of state.activePlans) {
        xmlParts.push('    <plan>');
        xmlParts.push(`      <id>${plan.id}</id>`);
        xmlParts.push(`      <title>${this.escapeXml(plan.title)}</title>`);
        xmlParts.push(`      <status>${plan.status}</status>`);
        xmlParts.push(`      <updated>${plan.updated}</updated>`);

        if (plan.steps.length > 0) {
          xmlParts.push('      <steps>');
          for (const step of plan.steps) {
            xmlParts.push('        <step>');
            xmlParts.push(`          <id>${step.id}</id>`);
            xmlParts.push(`          <desc>${this.escapeXml(step.description)}</desc>`);
            xmlParts.push(`          <status>${step.status}</status>`);
            if (step.dependencies && step.dependencies.length > 0) {
              xmlParts.push(`          <deps>${step.dependencies.join(',')}</deps>`);
            }
            xmlParts.push('        </step>');
          }
          xmlParts.push('      </steps>');
        }

        xmlParts.push('    </plan>');
      }
      xmlParts.push('  </plans>');
    }

    // Active File Paths (Limited to prevent bloat)
    const importantFiles = state.activeFilePaths
      .filter(f => f.type === 'component' || f.type === 'config' || f.type === 'api')
      .slice(0, 20); // Limit to 20 most important files

    if (importantFiles.length > 0) {
      xmlParts.push('  <files>');
      for (const file of importantFiles) {
        xmlParts.push('    <file>');
        xmlParts.push(`      <path>${this.escapeXml(file.path)}</path>`);
        xmlParts.push(`      <type>${file.type}</type>`);
        xmlParts.push(`      <modified>${file.lastModified}</modified>`);
        xmlParts.push('    </file>');
      }
      xmlParts.push('  </files>');
    }

    xmlParts.push('</cmp-state>');

    return xmlParts.join('\n');
  }

  deserialize(xmlContent: string): ProjectState {
    // For now, return a minimal state. In a full implementation,
    // this would parse the XML back into the ProjectState structure.
    // Since we're focusing on the save/load workflow, the deserialize
    // is mainly used for validation and would be expanded as needed.

    const timestamp = new Date().toISOString();

    return {
      timestamp,
      version: '1.0.0',
      architecturalDecisions: [],
      negativeConstraints: [],
      activePlans: [],
      activeFilePaths: [],
      metadata: {
        projectName: 'Unknown',
        workspaceRoot: process.cwd()
      }
    };
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Generate a compact system prompt from the serialized state
   * This is what gets injected into new chat sessions
   */
  generateSystemPrompt(stateXml: string): string {
    return `You are a Senior Software Engineer working on a complex platform project. Your intelligence and project knowledge must remain consistent across sessions.

PROJECT STATE (AXIOMS - TREAT AS LAW):
${stateXml}

CRITICAL RULES:
- Never violate the architectural decisions listed above
- Respect all constraints and negative patterns
- Follow the active development plans
- Use the established technology stack and patterns
- Maintain consistency with existing file structure and naming conventions

Your role: Implement features, fix bugs, and make architectural decisions while staying true to the established project state. When in doubt, reference the axioms above rather than making assumptions.`;
  }
}
