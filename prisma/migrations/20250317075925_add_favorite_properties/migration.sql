/*
  Warnings:

  - The values [APPROVED] on the enum `PropertyStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActive` on the `Property` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PropertyStatus_new" AS ENUM ('PENDING', 'REJECTED', 'EXPIRED', 'AVAILABLE', 'LEASED', 'SOLD');
ALTER TABLE "Property" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Property" ALTER COLUMN "status" TYPE "PropertyStatus_new" USING ("status"::text::"PropertyStatus_new");
ALTER TYPE "PropertyStatus" RENAME TO "PropertyStatus_old";
ALTER TYPE "PropertyStatus_new" RENAME TO "PropertyStatus";
DROP TYPE "PropertyStatus_old";
ALTER TABLE "Property" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "isActive";

-- CreateTable
CREATE TABLE "FavoriteProperties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteProperties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteProperties_propertyId_idx" ON "FavoriteProperties"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteProperties_userId_propertyId_key" ON "FavoriteProperties"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "FavoriteProperties" ADD CONSTRAINT "FavoriteProperties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteProperties" ADD CONSTRAINT "FavoriteProperties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
