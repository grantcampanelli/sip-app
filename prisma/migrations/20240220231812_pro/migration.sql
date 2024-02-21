/*
  Warnings:

  - You are about to drop the column `drinkDate` on the `Bottle` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Bottle` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Bottle` table. All the data in the column will be lost.
  - Added the required column `amountRemaining` to the `Bottle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finishDate` to the `Bottle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openDate` to the `Bottle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Bottle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servingSize` to the `Bottle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeO` to the `Bottle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bottle" DROP COLUMN "drinkDate",
DROP COLUMN "price",
DROP COLUMN "size",
ADD COLUMN     "amountRemaining" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finishDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "openDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "servingSize" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sizeO" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Storage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shelf" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "storageId" TEXT NOT NULL,
    "temp" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Shelf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShelfItem" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "bottleId" TEXT NOT NULL,
    "shelfId" TEXT NOT NULL,

    CONSTRAINT "ShelfItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShelfItem_bottleId_key" ON "ShelfItem"("bottleId");

-- CreateIndex
CREATE UNIQUE INDEX "ShelfItem_shelfId_key" ON "ShelfItem"("shelfId");

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelf" ADD CONSTRAINT "Shelf_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfItem" ADD CONSTRAINT "ShelfItem_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfItem" ADD CONSTRAINT "ShelfItem_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
