export type StateReviewWindows = {
  midMilestoneDays: number;
  finalMilestoneDays: number;
};

export type StateRule = {
  code: string;
  name: string;
  reviewWindows: StateReviewWindows;
  platformFeeCapBps: number | null;
  kycRequirement: 'STANDARD' | 'ENHANCED';
};

const STATE_RULES: Record<string, StateRule> = {
  TX: {
    code: 'TX',
    name: 'Texas',
    reviewWindows: { midMilestoneDays: 3, finalMilestoneDays: 5 },
    platformFeeCapBps: 350,
    kycRequirement: 'STANDARD',
  },
  OK: {
    code: 'OK',
    name: 'Oklahoma',
    reviewWindows: { midMilestoneDays: 4, finalMilestoneDays: 6 },
    platformFeeCapBps: 325,
    kycRequirement: 'STANDARD',
  },
  LA: {
    code: 'LA',
    name: 'Louisiana',
    reviewWindows: { midMilestoneDays: 5, finalMilestoneDays: 7 },
    platformFeeCapBps: 300,
    kycRequirement: 'ENHANCED',
  },
};

const DEFAULT_RULE: StateRule = STATE_RULES.TX;

export const getStateRule = (code: string): StateRule => {
  const upper = code.toUpperCase();
  return STATE_RULES[upper] ?? { ...DEFAULT_RULE, code: upper, name: upper };
};

export const listStateRules = (allowedStates: string[]): StateRule[] => {
  return allowedStates.map((state) => getStateRule(state));
};
