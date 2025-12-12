// Feature flag utilities using Flagsmith
// Placeholder implementation - integrate with actual Flagsmith SDK

export interface FlagEvaluation {
  enabled: boolean;
  variant?: string;
}

export const evaluateFlag = (flagKey: string): FlagEvaluation => {
  // TODO: Integrate with Flagsmith SDK
  // For now, return enabled for prep.task-combine.v1
  if (flagKey === 'prep.task-combine.v1') {
    return { enabled: true };
  }
  return { enabled: false };
};

export const isFeatureEnabled = (flagKey: string): boolean => {
  return evaluateFlag(flagKey).enabled;
};
