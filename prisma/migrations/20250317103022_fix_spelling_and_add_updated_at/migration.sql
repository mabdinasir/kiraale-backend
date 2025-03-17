/*
  Warnings:

  - Added the required column `updatedAt` to the `FavoriteProperties` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FavoriteProperties" DROP CONSTRAINT "FavoriteProperties_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteProperties" DROP CONSTRAINT "FavoriteProperties_userId_fkey";

-- AlterTable
ALTER TABLE "FavoriteProperties" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "FavoriteProperties_userId_idx" ON "FavoriteProperties"("userId");

-- AddForeignKey
ALTER TABLE "FavoriteProperties" ADD CONSTRAINT "FavoriteProperties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteProperties" ADD CONSTRAINT "FavoriteProperties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
