-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "screenshotDone" BOOLEAN NOT NULL DEFAULT false,
    "styleDone" BOOLEAN NOT NULL DEFAULT false,
    "subpagesDone" BOOLEAN NOT NULL DEFAULT false,
    "leadToolsDone" BOOLEAN NOT NULL DEFAULT false,
    "screenshotUrl" TEXT,
    "styleData" TEXT,
    "subpagesData" TEXT,
    "leadToolsData" TEXT
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    CONSTRAINT "Lead_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_analysisId_key" ON "Lead"("analysisId");
