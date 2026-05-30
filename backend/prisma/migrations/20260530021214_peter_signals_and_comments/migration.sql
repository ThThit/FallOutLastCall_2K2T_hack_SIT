/*
  Warnings:

  - You are about to drop the `SignalVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `category` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `dangerLevel` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `verificationRate` on the `Signal` table. All the data in the column will be lost.
  - Added the required column `authorName` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sector` to the `Signal` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SignalVerification_signalId_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SignalVerification";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signalId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Signal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sector" INTEGER NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'STANDARD',
    "trustScore" REAL NOT NULL DEFAULT 50,
    "verifiedCount" INTEGER NOT NULL DEFAULT 0,
    "unverifiedCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Signal" ("createdAt", "id", "trustScore", "updatedAt") SELECT "createdAt", "id", "trustScore", "updatedAt" FROM "Signal";
DROP TABLE "Signal";
ALTER TABLE "new_Signal" RENAME TO "Signal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
