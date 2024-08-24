/*
  Warnings:

  - You are about to drop the column `date` on the `commande` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `commande` DROP COLUMN `date`,
    ADD COLUMN `etat` ENUM('PENDING', 'CONFIRMED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    MODIFY `totalPrice` DOUBLE NOT NULL DEFAULT 0;
