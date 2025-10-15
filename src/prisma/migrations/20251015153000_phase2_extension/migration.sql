-- CreateEnum
CREATE TYPE "Trade" AS ENUM ('ROOFING', 'MOVING', 'SOLAR', 'TREE_TRIMMING', 'HOME_IMPROVEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "InviteRole" AS ENUM ('CONTRACTOR', 'HOMEOWNER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LICENSE', 'INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable User profiles
ALTER TABLE "User"
    ADD COLUMN "avatarUrl" TEXT,
    ADD COLUMN "bio" TEXT;

-- AlterTable Notification for read tracking
ALTER TABLE "Notification"
    ADD COLUMN "readAt" TIMESTAMP(3);

-- AlterTable Contractor enhancements
ALTER TABLE "Contractor"
    ADD COLUMN "serviceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "trades" "Trade"[] DEFAULT ARRAY[]::"Trade"[],
    ADD COLUMN "portfolio" JSONB,
    ADD COLUMN "verifiedKyc" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN "verifiedLicense" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN "verifiedInsurance" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN "ratingAvg" DECIMAL(4, 2) NOT NULL DEFAULT 0,
    ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable Homeowner additions
ALTER TABLE "Homeowner"
    ADD COLUMN "displayName" TEXT,
    ADD COLUMN "allowAlias" BOOLEAN NOT NULL DEFAULT TRUE;

-- CreateTable Review
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5),
    CONSTRAINT "Review_jobId_homeownerId_unique" UNIQUE ("jobId", "homeownerId"),
    CONSTRAINT "Review_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable Message
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachments" JSONB,
    "readByUserIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable Invite
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT,
    "role" "InviteRole" NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "token" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Invite_token_unique" UNIQUE ("token"),
    CONSTRAINT "Invite_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable Document
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX "contractor_verification_rating_idx" ON "Contractor" ("verifiedKyc", "verifiedLicense", "verifiedInsurance", "ratingAvg");
CREATE INDEX "contractor_trades_gin_idx" ON "Contractor" USING GIN ("trades");
CREATE INDEX "contractor_service_areas_gin_idx" ON "Contractor" USING GIN ("serviceAreas");

CREATE INDEX "review_contractor_created_idx" ON "Review" ("contractorId", "createdAt");

CREATE INDEX "message_job_created_idx" ON "Message" ("jobId", "createdAt");

CREATE INDEX "invite_email_status_idx" ON "Invite" ("email", "status");
CREATE INDEX "invite_token_idx" ON "Invite" ("token");

CREATE INDEX "document_status_idx" ON "Document" ("status");
