-- AlterTable: add missing columns to Analysis
ALTER TABLE "Analysis" ADD COLUMN "productsDone" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Analysis" ADD COLUMN "productsData" TEXT;
ALTER TABLE "Analysis" ADD COLUMN "popupDone" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Analysis" ADD COLUMN "popupData" TEXT;

-- AlterTable: add variant to Lead
ALTER TABLE "Lead" ADD COLUMN "variant" TEXT;
