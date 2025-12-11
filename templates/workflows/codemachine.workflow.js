// Workflow override to force OpenCode free models (grok-code / big-pickle) and avoid Codex.
const resolveStep = (agentId, overrides = {}) => ({ agentId, ...overrides });

export default {
  name: 'codemachine-opencode',
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

    // Single-pass check
    resolveStep('check-task', {
      engine: 'opencode',
      model: 'opencode/grok-code',
      modelReasoningEffort: 'medium',
      executeOnce: true
    })
  ]
};

