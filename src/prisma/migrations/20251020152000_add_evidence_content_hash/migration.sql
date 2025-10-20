ALTER TABLE "EvidenceFile"
    ADD COLUMN "contentHash" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "EvidenceFile_contentHash_key"
    ON "EvidenceFile" ("contentHash");
