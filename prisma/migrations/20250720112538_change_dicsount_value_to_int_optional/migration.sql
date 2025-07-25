/*
  Warnings:

  - The `value` column on the `Discount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "value",
ADD COLUMN     "value" INTEGER DEFAULT 0;
