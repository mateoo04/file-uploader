/*
  Warnings:

  - Added the required column `expiresAt` to the `ShareLink` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_folderId_fkey";

-- AlterTable
ALTER TABLE "ShareLink" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "folderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
