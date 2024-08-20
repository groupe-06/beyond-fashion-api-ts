-- DropForeignKey
ALTER TABLE `recharge` DROP FOREIGN KEY `recharge_receiverId_fkey`;

-- AlterTable
ALTER TABLE `recharge` MODIFY `receiverId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `recharge` ADD CONSTRAINT `recharge_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
