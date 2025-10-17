-- Phase 3 schema expansion: monetization, automation, analytics, referrals

-- New enums ---------------------------------------------------------------
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'VERIFIED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');
CREATE TYPE "PayoutType" AS ENUM ('STANDARD', 'INSTANT');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'SENT', 'SETTLED', 'FAILED');
CREATE TYPE "AiDisputeSuggestion" AS ENUM ('PARTIAL_RELEASE', 'PARTIAL_REFUND', 'RESUBMIT', 'UNSURE');
CREATE TYPE "AnalyticsSnapshotKind" AS ENUM ('CONTRACTOR', 'HOMEOWNER', 'ADMIN');
CREATE TYPE "ReferralEventType" AS ENUM ('SIGNED_UP', 'FIRST_FUNDED_JOB', 'CREDIT_REDEEMED');

-- Users ------------------------------------------------------------------
ALTER TABLE "User"
    ADD COLUMN "referralCode" TEXT,
    ADD COLUMN "referredByCode" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User" ("referralCode");

-- Contractors -------------------------------------------------------------
ALTER TABLE "Contractor"
    ADD COLUMN "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN "instantPayoutEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN "stripeCustomerId" TEXT,
    ADD COLUMN "stripeSubscriptionId" TEXT,
    ADD COLUMN "subscriptionRenewalAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Contractor_stripeCustomerId_key" ON "Contractor" ("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "contractor_subscription_idx" ON "Contractor" ("subscriptionTier", "subscriptionStatus");

-- Jobs -------------------------------------------------------------------
ALTER TABLE "Job"
    ADD COLUMN "platformFeeBps" INTEGER NOT NULL DEFAULT 150,
    ADD COLUMN "feeAmounts" JSONB DEFAULT '{}'::JSONB,
    ADD COLUMN "stateCode" CHAR(2) NOT NULL DEFAULT 'TX';

UPDATE "Job"
SET "feeAmounts" = jsonb_build_object(
        'platformFee', 0,
        'escrowFees', 0,
        'instantPayoutFee', 0
    )
WHERE "feeAmounts" = '{}'::jsonb;

-- Payouts ----------------------------------------------------------------
CREATE TABLE "Payout" (
    "id" TEXT PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "PayoutType" NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "processorRef" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payout_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payout_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payout_processorRef_key" ON "Payout" ("processorRef");
CREATE INDEX IF NOT EXISTS "payout_job_status_idx" ON "Payout" ("jobId", "status");
CREATE INDEX IF NOT EXISTS "payout_contractor_status_idx" ON "Payout" ("contractorId", "status");

-- AI dispute triage ------------------------------------------------------
CREATE TABLE "AiDisputeSummary" (
    "id" TEXT PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "suggestion" "AiDisputeSuggestion" NOT NULL,
    "confidence" DECIMAL(5,4),
    "modelInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiDisputeSummary_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AiDisputeSummary_disputeId_key" UNIQUE ("disputeId")
);

-- Analytics snapshots ----------------------------------------------------
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT PRIMARY KEY,
    "kind" "AnalyticsSnapshotKind" NOT NULL,
    "userId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "analytics_kind_user_period_idx" ON "AnalyticsSnapshot" ("kind", "userId", "periodStart");

-- Referrals --------------------------------------------------------------
CREATE TABLE "ReferralEvent" (
    "id" TEXT PRIMARY KEY,
    "referrerUserId" TEXT NOT NULL,
    "referredUserId" TEXT,
    "event" "ReferralEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralEvent_referrerUserId_fkey" FOREIGN KEY ("referrerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReferralEvent_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "referral_referrer_event_idx" ON "ReferralEvent" ("referrerUserId", "event");

