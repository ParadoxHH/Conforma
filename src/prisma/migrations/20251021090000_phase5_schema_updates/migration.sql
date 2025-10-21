-- CreateEnum
CREATE TYPE "AIStatus" AS ENUM ('NONE', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');

-- AlterEnum
BEGIN;
CREATE TYPE "DocumentType_new" AS ENUM ('LICENSE', 'INSURANCE', 'CERT');
ALTER TABLE "Document" ALTER COLUMN "type" TYPE "DocumentType_new" USING ("type"::text::"DocumentType_new");
ALTER TYPE "DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "DocumentType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Contractor" ADD COLUMN     "avgApprovalTimeMs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completionRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
ADD COLUMN     "disputeRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
ADD COLUMN     "verifiedDocsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Homeowner" ADD COLUMN     "approvalConsistency" DECIMAL(5,4) NOT NULL DEFAULT 0,
ADD COLUMN     "avgDecisionTimeMs" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "aiStatus",
ADD COLUMN     "aiStatus" "AIStatus" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "RiskConfig" ALTER COLUMN "id" SET DEFAULT 1;

-- DropEnum
DROP TYPE "DocumentAiStatus";

-- CreateTable
CREATE TABLE "StateRule" (
    "code" CHAR(2) NOT NULL,
    "name" TEXT NOT NULL,
    "reviewWindowMidDays" INTEGER NOT NULL DEFAULT 3,
    "reviewWindowFinalDays" INTEGER NOT NULL DEFAULT 5,
    "platformFeeBps" INTEGER NOT NULL DEFAULT 150,
    "kycRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StateRule_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "document_ai_status_idx" ON "Document"("aiStatus");

-- CreateIndex
CREATE INDEX "document_user_status_idx" ON "Document"("userId", "status");
