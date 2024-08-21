/*
  Warnings:

  - You are about to alter the column `content` on the `comment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(800)` to `VarChar(191)`.
  - You are about to drop the column `bust` on the `female_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `inseam` on the `female_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `shoulder` on the `female_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `thigh` on the `female_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `armhole` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `back` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `calf` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `hips` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `shoulder` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `sleeveLength` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `thigh` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to alter the column `description` on the `post` table. The data in that column could be lost. The data in that column will be cast from `VarChar(800)` to `VarChar(191)`.
  - You are about to alter the column `description` on the `rate` table. The data in that column could be lost. The data in that column will be cast from `VarChar(800)` to `VarChar(191)`.
  - You are about to drop the column `code` on the `recharge` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `recharge` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `story` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `story` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `story` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `story` table. All the data in the column will be lost.
  - Added the required column `height` to the `female_measurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `female_measurement` table without a default value. This is not possible if the table is not empty.
  - Made the column `chest` on table `female_measurement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `waist` on table `female_measurement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hips` on table `female_measurement` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `height` to the `male_measurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `male_measurement` table without a default value. This is not possible if the table is not empty.
  - Made the column `chest` on table `male_measurement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `waist` on table `male_measurement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `neck` on table `male_measurement` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `recharge` table without a default value. This is not possible if the table is not empty.
  - Made the column `receiverId` on table `recharge` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `story` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `recharge` DROP FOREIGN KEY `recharge_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `story` DROP FOREIGN KEY `story_authorId_fkey`;

-- DropIndex
DROP INDEX `recharge_code_key` ON `recharge`;

-- AlterTable
ALTER TABLE `comment` MODIFY `content` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `female_measurement` DROP COLUMN `bust`,
    DROP COLUMN `inseam`,
    DROP COLUMN `shoulder`,
    DROP COLUMN `thigh`,
    ADD COLUMN `height` INTEGER NOT NULL,
    ADD COLUMN `weight` INTEGER NOT NULL,
    MODIFY `chest` INTEGER NOT NULL,
    MODIFY `waist` INTEGER NOT NULL,
    MODIFY `hips` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `male_measurement` DROP COLUMN `armhole`,
    DROP COLUMN `back`,
    DROP COLUMN `calf`,
    DROP COLUMN `hips`,
    DROP COLUMN `shoulder`,
    DROP COLUMN `sleeveLength`,
    DROP COLUMN `thigh`,
    ADD COLUMN `height` INTEGER NOT NULL,
    ADD COLUMN `weight` INTEGER NOT NULL,
    MODIFY `chest` INTEGER NOT NULL,
    MODIFY `waist` INTEGER NOT NULL,
    MODIFY `neck` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `post` MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `rate` MODIFY `stars` DOUBLE NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `recharge` DROP COLUMN `code`,
    DROP COLUMN `isUsed`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `receiverId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `story` DROP COLUMN `authorId`,
    DROP COLUMN `description`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `publishedAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `stockQuantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `photo` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ArticleToTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ArticleToTag_AB_unique`(`A`, `B`),
    INDEX `_ArticleToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ArticleToPost` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ArticleToPost_AB_unique`(`A`, `B`),
    INDEX `_ArticleToPost_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `article` ADD CONSTRAINT `article_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article` ADD CONSTRAINT `article_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `category_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recharge` ADD CONSTRAINT `recharge_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `story` ADD CONSTRAINT `story_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleToTag` ADD CONSTRAINT `_ArticleToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleToTag` ADD CONSTRAINT `_ArticleToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleToPost` ADD CONSTRAINT `_ArticleToPost_A_fkey` FOREIGN KEY (`A`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleToPost` ADD CONSTRAINT `_ArticleToPost_B_fkey` FOREIGN KEY (`B`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
