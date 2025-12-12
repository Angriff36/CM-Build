// Official CodeMachine workflow structure, pinned to OpenCode free models.
export default {
  name: 'CodeMachine Workflow (opencode)',
  steps: [
    resolveStep('init', { executeOnce: true, engine: 'opencode', model: 'opencode/grok-code', modelReasoningEffort: 'low' }),
    resolveStep('principal-analyst', { executeOnce: true, engine: 'opencode', model: 'opencode/grok-code' }),
    resolveUI('∴ Planning Phase ∴'),
    resolveStep('blueprint-orchestrator', { executeOnce: true, engine: 'opencode', model: 'opencode/grok-code' }),
    resolveStep('plan-agent', { executeOnce: true, engine: 'opencode', model: 'opencode/grok-code', notCompletedFallback: 'plan-fallback' }),
    resolveStep('task-breakdown', { executeOnce: true, engine: 'opencode', model: 'opencode/grok-code' }),
    resolveStep('git-commit', { executeOnce: true, engine: 'cursor' }),
    resolveUI('⟲ Development Cycle ⟲'),
    resolveStep('context-manager', { engine: 'opencode', model: 'opencode/grok-code' }),
    resolveStep('code-generation', { engine: 'opencode', model: 'opencode/grok-code' }),
    resolveStep('runtime-prep', { executeOnce: true, engine: 'opencode', model: 'opencode/big-pickle' }),
    resolveUI('✓ Sanity Check Passed'),
    resolveStep('git-commit', { engine: 'cursor' }),
    resolveUI('◈◈ Iteration Gate ◈◈'),
    resolveModule('check-task', { engine: 'opencode', model: 'opencode/grok-code', loopSteps: 6, loopMaxIterations: 20, loopSkip: ['runtime-prep'] }),
  ],
  subAgentIds: [
    'founder-architect',
    'structural-data-architect',
    'behavior-architect',
    'ui-ux-architect',
    'operational-architect',
    'file-assembler'
  ]
};
