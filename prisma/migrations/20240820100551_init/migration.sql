/*
  Warnings:

  - You are about to drop the column `parentId` on the `comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_parentId_fkey`;

-- AlterTable
ALTER TABLE `comment` DROP COLUMN `parentId`;
