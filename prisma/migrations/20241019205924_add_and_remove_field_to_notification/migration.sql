/*
  Warnings:

  - You are about to drop the column `followerId` on the `notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification" DROP COLUMN "followerId",
ADD COLUMN     "emetorId" INTEGER;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_emetorId_fkey" FOREIGN KEY ("emetorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
