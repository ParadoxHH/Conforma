-- Phase 5: automated verification, risk controls, observability foundations

-- ----------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------
CREATE TYPE "DocumentAiStatus" AS ENUM ('NONE', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');

ALTER TYPE "DocumentType" ADD VALUE 'CERT';
ALTER TYPE "DocumentStatus" ADD VALUE 'NEEDS_REVIEW';
ALTER TYPE "DocumentStatus" ADD VALUE 'EXPIRED';

-- ----------------------------------------------------------------------
-- Documents
-- ----------------------------------------------------------------------
ALTER TABLE "Document"
    ADD COLUMN "aiStatus" "DocumentAiStatus" NOT NULL DEFAULT 'NONE',
    ADD COLUMN "aiConfidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    ADD COLUMN "aiReason" TEXT,
    ADD COLUMN "issuer" TEXT,
    ADD COLUMN "policyNumber" TEXT,
    ADD COLUMN "effectiveFrom" TIMESTAMPTZ(6),
    ADD COLUMN "effectiveTo" TIMESTAMPTZ(6);

CREATE INDEX IF NOT EXISTS "document_ai_status_idx" ON "Document" ("aiStatus");
CREATE INDEX IF NOT EXISTS "document_user_type_idx" ON "Document" ("userId", "type");

-- ----------------------------------------------------------------------
-- Risk configuration & events
-- ----------------------------------------------------------------------
CREATE TABLE "RiskConfig" (
    "id" INTEGER PRIMARY KEY,
    "allowThreshold" INTEGER NOT NULL DEFAULT 25,
    "blockThreshold" INTEGER NOT NULL DEFAULT 50,
    "maxJobAmountByTrade" JSONB,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "RiskConfig" ("id", "allowThreshold", "blockThreshold", "maxJobAmountByTrade")
VALUES (1, 25, 50, '{}'::JSONB)
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE "RiskEvent" (
    "id" TEXT PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reasons" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiskEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "risk_event_job_created_idx" ON "RiskEvent" ("jobId", "createdAt");
