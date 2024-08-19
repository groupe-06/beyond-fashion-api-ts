/*
  Warnings:

  - Made the column `expiresAt` on table `story` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `story` MODIFY `expiresAt` DATETIME(3) NOT NULL;
