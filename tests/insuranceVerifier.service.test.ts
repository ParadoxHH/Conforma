import { describe, expect, it } from 'vitest';
import { DocumentType } from '@prisma/client';

import { verificationTestHelpers } from '../src/services/insuranceVerifier';

const { parseWithRegex, mergeParsedFields, decideVerification, parseDateString } =
  verificationTestHelpers;

describe('insurance verifier helpers', () => {
  it('extracts issuer, policy number, and dates from raw text', () => {
    const sampleText = `
      Certificate Holder: Conforma Ops Team
      Insurer: Lone Star General Insurance Co.
      Policy Number: GL-123456789
      Effective Date: 04/01/2024
      Expiration Date: 04/01/2025
    `;

    const parsed = parseWithRegex(sampleText);

    expect(parsed.issuer).toBe('Lone Star General Insurance Co.');
    expect(parsed.policyNumber).toBe('GL-123456789');
    expect(parsed.effectiveFrom).toBeInstanceOf(Date);
    expect(parsed.effectiveTo).toBeInstanceOf(Date);
  });

  it('prefers merged fields when LLM data fills missing information', () => {
    const regexParsed = {
      issuer: undefined,
      policyNumber: 'GL-1234',
      effectiveFrom: null,
      effectiveTo: null,
      coverage: ['General Liability'],
    };
    const llmParsed = {
      issuer: 'Lone Star Insurance',
      policyNumber: 'GL-1234',
      effectiveFrom: '2024-04-01',
      effectiveTo: '2025-04-01',
      coverage: ['Workers Compensation'],
    };

    const merged = mergeParsedFields(regexParsed, llmParsed);

    expect(merged.issuer).toBe('Lone Star Insurance');
    expect(merged.coverage).toEqual(['General Liability', 'Workers Compensation']);
    expect(merged.effectiveFrom).toBeInstanceOf(Date);
    expect(merged.effectiveTo).toBeInstanceOf(Date);
  });

  it('auto-approves valid insurance with active dates', () => {
    const fields = {
      issuer: 'Lone Star Insurance',
      policyNumber: 'GL-1234',
      effectiveFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      effectiveTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      coverage: ['General Liability'],
    };

    const decision = decideVerification(DocumentType.INSURANCE, fields);

    expect(decision.status).toBe('APPROVED');
    expect(decision.aiStatus).toBe('APPROVED');
    expect(decision.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('rejects documents that are expired', () => {
    const fields = {
      issuer: 'Lone Star Insurance',
      policyNumber: 'GL-1234',
      effectiveFrom: new Date('2023-01-01'),
      effectiveTo: new Date('2023-12-31'),
      coverage: ['General Liability'],
    };

    const decision = decideVerification(DocumentType.INSURANCE, fields);

    expect(decision.status).toBe('REJECTED');
    expect(decision.aiStatus).toBe('REJECTED');
  });

  it('parses shorthand date formats', () => {
    expect(parseDateString('04/01/2024')).toBeInstanceOf(Date);
    expect(parseDateString('04-01-24')).toBeInstanceOf(Date);
    expect(parseDateString('April 1, 2024')).toBeInstanceOf(Date);
    expect(parseDateString('invalid')).toBeNull();
  });
});
