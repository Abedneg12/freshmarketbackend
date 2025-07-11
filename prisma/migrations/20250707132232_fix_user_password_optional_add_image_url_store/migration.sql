-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "imageUrl" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
