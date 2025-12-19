export default {
  name: 'CodeMachine Workflow (opencode + claude)',
  steps: [
    resolveStep('init', { executeOnce: true, engine: 'opencode', model: 'opencode/grok-code', modelReasoningEffort: 'low' }),
    resolveStep('principal-analyst', { executeOnce: true, engine: 'claude' }),
    resolveUI('∴ Planning Phase ∴'),
    resolveStep('blueprint-orchestrator', { executeOnce: true, engine: 'opencode', model: 'opencode/glm-4.6' }),
    resolveStep('plan-agent', { executeOnce: true, engine: 'opencode', model: 'opencode/glm-4.6', notCompletedFallback: 'plan-fallback' }),
    resolveStep('task-breakdown', { executeOnce: true, engine: 'claude' }),
    resolveStep('git-commit', { executeOnce: true, engine: 'opencode', model: 'opencode/gpt-5.1-codex-max' }),
    resolveUI('⟲ Development Cycle ⟲'),
    resolveStep('context-manager', { engine: 'opencode', model: 'opencode/grok-code' }),
    resolveStep('code-generation', { engine: 'opencode', model: 'opencode/gpt-5.1-codex-max', validation: 'strict', includeTests: true, includeTyping: true }),
    resolveStep('runtime-prep', { executeOnce: true, engine: 'claude' }),
    resolveStep('task-sanity-check', { engine: 'opencode', model: 'opencode/glm-4.6' }),
    resolveStep('git-commit', { engine: 'opencode', model: 'opencode/gpt-5.1-codex-max' }),
    resolveUI('◈◈ Iteration Gate ◈◈'),
    resolveModule('check-task', { engine: 'opencode', model: 'opencode/grok-code', loopSteps: 6, loopMaxIterations: 20,  loopSkip: ['runtime-prep']  }), // Loop back if tasks are not completed
  ],
  subAgentIds: [
    // architecture sub-agents
    'founder-architect',
    'structural-data-architect',
    'behavior-architect',
    'ui-ux-architect',
    'operational-architect',
    'file-assembler'
  ],
};
