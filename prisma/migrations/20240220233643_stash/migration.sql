/*
  Warnings:

  - You are about to drop the column `sizeO` on the `Bottle` table. All the data in the column will be lost.
  - You are about to drop the column `storageId` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the `Storage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Shelf" DROP CONSTRAINT "Shelf_storageId_fkey";

-- DropForeignKey
ALTER TABLE "Storage" DROP CONSTRAINT "Storage_userId_fkey";

-- AlterTable
ALTER TABLE "Bottle" DROP COLUMN "sizeO",
ADD COLUMN     "size" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Shelf" DROP COLUMN "storageId",
ADD COLUMN     "stashId" TEXT;

-- DropTable
DROP TABLE "Storage";

-- CreateTable
CREATE TABLE "Stash" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Stash_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stash" ADD CONSTRAINT "Stash_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelf" ADD CONSTRAINT "Shelf_stashId_fkey" FOREIGN KEY ("stashId") REFERENCES "Stash"("id") ON DELETE CASCADE ON UPDATE CASCADE;
