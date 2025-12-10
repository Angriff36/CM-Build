// Workflow that forces every step to use gpt-5.1-codex-max.
// Based on the default CodeMachine sequence with per-step engine/model overrides.
const resolveStep = (agentId, overrides = {}) => ({ agentId, ...overrides });
const resolveModule = (moduleId, overrides = {}) => ({ moduleId, ...overrides, type: 'module' });

export default {
  name: 'codemachine-codex-max',
  steps: [
    // One-time strategic setup steps
    resolveStep('arch-agent', { engine: 'opencode', model: 'opencode/grok-code', modelReasoningEffort: 'high', executeOnce: true }),
    resolveStep('plan-agent', { engine: 'opencode', model: 'opencode/grok-code', modelReasoningEffort: 'high', executeOnce: true }),
    resolveStep('task-breakdown', { engine: 'opencode', model: 'opencode/grok-code', modelReasoningEffort: 'high', executeOnce: true }),

    // Main task loop: context → code → cleanup → runtime prep (first pass) → sanity check → commit
    resolveStep('context-manager', { engine: 'opencode', model: 'opencode/grok-code', modelReasoningEffort: 'medium' }),
    resolveStep('code-generation', { engine: 'opencode', model: 'opencode/grok-code', modelReasoningEffort: 'medium' }),
    resolveStep('cleanup-code-fallback', { engine: 'opencode', model: 'opencode/big-pickle', modelReasoningEffort: 'low' }),
    resolveStep('runtime-prep', { engine: 'opencode', model: 'opencode/big-pickle', modelReasoningEffort: 'low', executeOnce: true }),
    resolveStep('task-sanity-check', { engine: 'opencode', model: 'opencode/grok-code', modelReasoningEffort: 'medium' }),
    resolveStep('git-commit', { engine: 'opencode', model: 'opencode/big-pickle', modelReasoningEffort: 'low' }),

    // Loop controller
    resolveModule('check-task', {
      engine: 'opencode',
      model: 'opencode/big-pickle',
      loopSkip: ['runtime-prep'],
      loopSteps: 6,
      loopMaxIterations: 20
    })
  ]
};

