/*
  Warnings:

  - You are about to drop the column `wineId` on the `Bottle` table. All the data in the column will be lost.
  - You are about to drop the `Wine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Winery` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `Bottle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bottle" DROP CONSTRAINT "Bottle_wineId_fkey";

-- DropForeignKey
ALTER TABLE "Wine" DROP CONSTRAINT "Wine_wineryId_fkey";

-- AlterTable
ALTER TABLE "Bottle" DROP COLUMN "wineId",
ADD COLUMN     "productId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Wine";

-- DropTable
DROP TABLE "Winery";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vintage" TEXT NOT NULL,
    "varietal" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
