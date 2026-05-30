-- Add a dedicated archive date field so the UI can show the actual memory date.
ALTER TABLE "MemoryArchive" ADD COLUMN "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
