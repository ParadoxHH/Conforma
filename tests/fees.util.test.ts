import { describe, it, expect } from 'vitest';
import { calculateFees } from '../src/utils/fees';

describe('Fee utilities', () => {
  it('calculates platform and instant payout fees from basis points', () => {
    const result = calculateFees(10000, { platformFeeBps: 150, instantPayoutFeeBps: 100, applyInstantPayout: true });
    expect(result.platformFee).toBeCloseTo(150);
    expect(result.instantPayoutFee).toBeCloseTo(100);
    expect(result.totalFees).toBeCloseTo(250);
    expect(result.netPayout).toBeCloseTo(9750);
  });

  it('omits instant fee when not applied', () => {
    const result = calculateFees(5000, { platformFeeBps: 200 });
    expect(result.instantPayoutFee).toBe(0);
    expect(result.totalFees).toBeCloseTo(100);
    expect(result.netPayout).toBeCloseTo(4900);
  });
});
