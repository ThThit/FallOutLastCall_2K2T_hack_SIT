/*
  Warnings:

  - You are about to drop the `SignalVerification` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Signal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `message` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `trustScore` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `verificationRate` on the `Signal` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Signal` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `content` to the `Signal` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SignalVerification_signalId_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SignalVerification";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Verification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "signalId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Verification_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Signal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dangerLevel" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Signal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Signal" ("category", "createdAt", "dangerLevel", "id", "title", "updatedAt", "userId") SELECT "category", "createdAt", "dangerLevel", "id", "title", "updatedAt", "userId" FROM "Signal";
DROP TABLE "Signal";
ALTER TABLE "new_Signal" RENAME TO "Signal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Verification_signalId_userId_key" ON "Verification"("signalId", "userId");
