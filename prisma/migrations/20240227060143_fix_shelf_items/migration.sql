-- DropForeignKey
ALTER TABLE "ShelfItem" DROP CONSTRAINT "ShelfItem_bottleId_fkey";

-- DropForeignKey
ALTER TABLE "ShelfItem" DROP CONSTRAINT "ShelfItem_shelfId_fkey";

-- DropIndex
DROP INDEX "ShelfItem_shelfId_key";

-- AlterTable
ALTER TABLE "Bottle" ALTER COLUMN "servingSize" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ShelfItem" ADD CONSTRAINT "ShelfItem_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfItem" ADD CONSTRAINT "ShelfItem_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
