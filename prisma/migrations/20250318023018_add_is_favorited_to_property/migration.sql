-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isFavorited" BOOLEAN DEFAULT false;
