/*
  Warnings:

  - You are about to drop the column `unitId` on the `category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `category_unitId_fkey`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `unitId`;

-- CreateTable
CREATE TABLE `_CategoryToUnit` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CategoryToUnit_AB_unique`(`A`, `B`),
    INDEX `_CategoryToUnit_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CategoryToUnit` ADD CONSTRAINT `_CategoryToUnit_A_fkey` FOREIGN KEY (`A`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoryToUnit` ADD CONSTRAINT `_CategoryToUnit_B_fkey` FOREIGN KEY (`B`) REFERENCES `unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
