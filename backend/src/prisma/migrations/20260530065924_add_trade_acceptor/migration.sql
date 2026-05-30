-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "requestedItem" TEXT NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "traderName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "creatorId" TEXT NOT NULL,
    "vaultItemId" TEXT,
    "acceptorId" TEXT,
    "acceptorVaultItemId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trade_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trade_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trade_acceptorId_fkey" FOREIGN KEY ("acceptorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trade_acceptorVaultItemId_fkey" FOREIGN KEY ("acceptorVaultItemId") REFERENCES "VaultItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trade" ("category", "condition", "createdAt", "creatorId", "id", "location", "quantity", "requestedItem", "requestedQuantity", "resourceName", "status", "traderName", "updatedAt", "vaultItemId") SELECT "category", "condition", "createdAt", "creatorId", "id", "location", "quantity", "requestedItem", "requestedQuantity", "resourceName", "status", "traderName", "updatedAt", "vaultItemId" FROM "Trade";
DROP TABLE "Trade";
ALTER TABLE "new_Trade" RENAME TO "Trade";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
