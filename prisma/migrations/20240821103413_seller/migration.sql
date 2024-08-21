/*
  Warnings:

  - You are about to drop the column `height` on the `female_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `female_measurement` table. All the data in the column will be lost.
  - You are about to alter the column `chest` on the `female_measurement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `waist` on the `female_measurement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `hips` on the `female_measurement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `height` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `male_measurement` table. All the data in the column will be lost.
  - You are about to alter the column `chest` on the `male_measurement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `waist` on the `male_measurement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `neck` on the `male_measurement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `updatedAt` on the `recharge` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `story` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `story` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `story` table. All the data in the column will be lost.
  - You are about to drop the `_ArticleToPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArticleToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `recharge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `recharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `story` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ArticleToPost` DROP FOREIGN KEY `_ArticleToPost_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ArticleToPost` DROP FOREIGN KEY `_ArticleToPost_B_fkey`;

-- DropForeignKey
ALTER TABLE `_ArticleToTag` DROP FOREIGN KEY `_ArticleToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ArticleToTag` DROP FOREIGN KEY `_ArticleToTag_B_fkey`;

-- DropForeignKey
ALTER TABLE `_CategoryToUnit` DROP FOREIGN KEY `_CategoryToUnit_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CategoryToUnit` DROP FOREIGN KEY `_CategoryToUnit_B_fkey`;

-- DropForeignKey
ALTER TABLE `article` DROP FOREIGN KEY `article_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `article` DROP FOREIGN KEY `article_userId_fkey`;

-- DropForeignKey
ALTER TABLE `recharge` DROP FOREIGN KEY `recharge_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `story` DROP FOREIGN KEY `story_userId_fkey`;

-- AlterTable
ALTER TABLE `comment` MODIFY `content` VARCHAR(800) NOT NULL;

-- AlterTable
ALTER TABLE `female_measurement` DROP COLUMN `height`,
    DROP COLUMN `weight`,
    ADD COLUMN `bust` DOUBLE NULL,
    ADD COLUMN `inseam` DOUBLE NULL,
    ADD COLUMN `shoulder` DOUBLE NULL,
    ADD COLUMN `thigh` DOUBLE NULL,
    MODIFY `chest` DOUBLE NULL,
    MODIFY `waist` DOUBLE NULL,
    MODIFY `hips` DOUBLE NULL;

-- AlterTable
ALTER TABLE `male_measurement` DROP COLUMN `height`,
    DROP COLUMN `weight`,
    ADD COLUMN `armhole` DOUBLE NULL,
    ADD COLUMN `back` DOUBLE NULL,
    ADD COLUMN `calf` DOUBLE NULL,
    ADD COLUMN `hips` DOUBLE NULL,
    ADD COLUMN `shoulder` DOUBLE NULL,
    ADD COLUMN `sleeveLength` DOUBLE NULL,
    ADD COLUMN `thigh` DOUBLE NULL,
    MODIFY `chest` DOUBLE NULL,
    MODIFY `waist` DOUBLE NULL,
    MODIFY `neck` DOUBLE NULL;

-- AlterTable
ALTER TABLE `post` MODIFY `description` VARCHAR(800) NULL;

-- AlterTable
ALTER TABLE `rate` MODIFY `stars` FLOAT NOT NULL,
    MODIFY `description` VARCHAR(800) NULL;

-- AlterTable
ALTER TABLE `recharge` DROP COLUMN `updatedAt`,
    ADD COLUMN `code` BIGINT NOT NULL,
    ADD COLUMN `isUsed` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `receiverId` INTEGER NULL;

-- AlterTable
ALTER TABLE `story` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `authorId` INTEGER NOT NULL,
    ADD COLUMN `description` VARCHAR(200) NULL,
    ADD COLUMN `expiresAt` DATETIME(3) NOT NULL,
    ADD COLUMN `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `_ArticleToPost`;

-- DropTable
DROP TABLE `_ArticleToTag`;

-- DropTable
DROP TABLE `_CategoryToUnit`;

-- DropTable
DROP TABLE `article`;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `tag`;

-- DropTable
DROP TABLE `unit`;

-- CreateIndex
CREATE UNIQUE INDEX `recharge_code_key` ON `recharge`(`code`);

-- AddForeignKey
ALTER TABLE `recharge` ADD CONSTRAINT `recharge_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `story` ADD CONSTRAINT `story_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
