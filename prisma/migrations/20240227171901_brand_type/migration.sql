-- CreateEnum
CREATE TYPE "BrandType" AS ENUM ('SPIRIT', 'WINE', 'BEER');

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "type" "BrandType";
