-- CreateTable
CREATE TABLE "MemoryArchive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "survivorAlias" TEXT NOT NULL DEFAULT 'Anonymous',
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "emotionalTag" TEXT NOT NULL,
    "decayLevel" INTEGER NOT NULL DEFAULT 0,
    "isRestored" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);