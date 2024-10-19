/*
  Warnings:

  - Added the required column `type` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "followerId" INTEGER,
ADD COLUMN     "postId" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL;
