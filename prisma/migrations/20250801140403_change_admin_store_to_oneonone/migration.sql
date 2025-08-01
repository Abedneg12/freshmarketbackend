/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `StoreAdminAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StoreAdminAssignment_userId_key" ON "StoreAdminAssignment"("userId");
