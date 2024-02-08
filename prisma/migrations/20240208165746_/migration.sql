-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vintage" TEXT NOT NULL,
    "varietal" TEXT NOT NULL,
    "wineryId" TEXT NOT NULL,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Winery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bottle" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "drinkDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Bottle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Wine" ADD CONSTRAINT "Wine_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES "Winery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
