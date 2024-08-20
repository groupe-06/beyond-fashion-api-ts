/*
  Warnings:

  - You are about to drop the column `gender` on the `female_measurement` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `male_measurement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `female_measurement` DROP COLUMN `gender`;

-- AlterTable
ALTER TABLE `male_measurement` DROP COLUMN `gender`;
