import { FeeBreakdown, appConfig, defaultFeeBreakdown } from '../config/app.config';

type FeeOptions = {
  platformFeeBps?: number;
  escrowFeeBps?: number;
  instantPayoutFeeBps?: number;
  applyInstantPayout?: boolean;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const calculateFees = (totalAmount: number, options: FeeOptions = {}): FeeBreakdown => {
  const {
    platformFeeBps = appConfig.platformFeeBps,
    escrowFeeBps = 0,
    instantPayoutFeeBps = appConfig.instantPayoutFeeBps,
    applyInstantPayout = false,
  } = options;

  const total = totalAmount ?? 0;
  const platformFee = roundCurrency((platformFeeBps / 10000) * total);
  const escrowFees = roundCurrency((escrowFeeBps / 10000) * total);
  const instantPayoutFee = applyInstantPayout ? roundCurrency((instantPayoutFeeBps / 10000) * total) : 0;

  const totalFees = roundCurrency(platformFee + escrowFees + instantPayoutFee);
  const netPayout = roundCurrency(total - totalFees);

  return {
    platformFee,
    escrowFees,
    instantPayoutFee,
    totalFees,
    netPayout,
    currency: appConfig.accountingExportCurrency,
  };
};

export const mergeFeeBreakdowns = (...feeBreakdowns: (FeeBreakdown | null | undefined)[]): FeeBreakdown => {
  const base = defaultFeeBreakdown();

  feeBreakdowns.filter(Boolean).forEach((breakdown) => {
    base.platformFee = roundCurrency(base.platformFee + (breakdown?.platformFee ?? 0));
    base.escrowFees = roundCurrency(base.escrowFees + (breakdown?.escrowFees ?? 0));
    base.instantPayoutFee = roundCurrency(base.instantPayoutFee + (breakdown?.instantPayoutFee ?? 0));
    base.netPayout = roundCurrency(base.netPayout + (breakdown?.netPayout ?? 0));
  });

  base.totalFees = roundCurrency(base.platformFee + base.escrowFees + base.instantPayoutFee);

  return base;
};

export const ensureFeeBreakdown = (raw: unknown): FeeBreakdown => {
  if (!raw || typeof raw !== 'object') {
    return defaultFeeBreakdown();
  }

  const casted = raw as Record<string, unknown>;
  return {
    platformFee: Number(casted.platformFee ?? 0),
    escrowFees: Number(casted.escrowFees ?? 0),
    instantPayoutFee: Number(casted.instantPayoutFee ?? 0),
    totalFees: Number(casted.totalFees ?? 0),
    netPayout: Number(casted.netPayout ?? 0),
    currency: (casted.currency as string) ?? appConfig.accountingExportCurrency,
  };
};
