-- CreateTable
CREATE TABLE "MemoryArchiveRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memoryId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "titleBefore" TEXT NOT NULL,
    "titleAfter" TEXT NOT NULL,
    "survivorAliasBefore" TEXT NOT NULL,
    "survivorAliasAfter" TEXT NOT NULL,
    "categoryBefore" TEXT NOT NULL,
    "categoryAfter" TEXT NOT NULL,
    "contentBefore" TEXT NOT NULL,
    "contentAfter" TEXT NOT NULL,
    "emotionalTagBefore" TEXT NOT NULL,
    "emotionalTagAfter" TEXT NOT NULL,
    "decayLevelBefore" INTEGER,
    "decayLevelAfter" INTEGER,
    "isRestoredBefore" BOOLEAN,
    "isRestoredAfter" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemoryArchiveRevision_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "MemoryArchive" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MemoryArchiveRevision_memoryId_createdAt_idx" ON "MemoryArchiveRevision"("memoryId", "createdAt");