// Workflow that forces every step to use gpt-5.1-codex-max.
// Based on the default CodeMachine sequence with per-step engine/model overrides.
const resolveStep = (agentId, overrides = {}) => ({ agentId, ...overrides });
const resolveModule = (moduleId, overrides = {}) => ({ moduleId, ...overrides, type: 'module' });

export default {
  name: 'codemachine-codex-max',
  steps: [
    // One-time strategic setup steps
    resolveStep('arch-agent', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'high', executeOnce: true }),
    resolveStep('plan-agent', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'high', executeOnce: true }),
    resolveStep('task-breakdown', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'high', executeOnce: true }),

    // Main task loop: context → code → cleanup → runtime prep (first pass) → sanity check → commit
    resolveStep('context-manager', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'medium' }),
    resolveStep('code-generation', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'medium' }),
    resolveStep('cleanup-code-fallback', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'low' }),
    resolveStep('runtime-prep', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'low', executeOnce: true }),
    resolveStep('task-sanity-check', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'medium' }),
    resolveStep('git-commit', { engine: 'codex', model: 'gpt-5.1-codex-max', modelReasoningEffort: 'low' }),

    // Loop controller
    resolveModule('check-task', {
      engine: 'codex',
      model: 'gpt-5.1-codex-max',
      loopSkip: ['runtime-prep'],
      loopSteps: 6,
      loopMaxIterations: 20
    })
  ]
};

