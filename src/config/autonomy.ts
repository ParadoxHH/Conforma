const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes', 'y', 'on'].includes(value.toLowerCase());
};

export const autonomyConfig = {
  autonomyEnabled: parseBoolean(process.env.AUTONOMY_ENABLED, true),
  emailsEnabled: parseBoolean(process.env.EMAILS_ENABLED, true),
  aiDocVerifyEnabled: parseBoolean(process.env.AI_DOC_VERIFY_ENABLED, true),
  riskRulesEnabled: parseBoolean(process.env.RISK_RULES_ENABLED, true),
  observabilityEnabled: parseBoolean(process.env.OBSERVABILITY_ENABLED, true),
  weeklyDigestEnabled: parseBoolean(process.env.WEEKLY_DIGEST_ENABLED, true),
};

export type AutonomyFlags = typeof autonomyConfig;
