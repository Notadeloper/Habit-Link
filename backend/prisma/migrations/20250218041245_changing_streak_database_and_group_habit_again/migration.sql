/*
  Warnings:

  - You are about to drop the column `groupId` on the `GroupHabit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupHabitId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupHabitId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroupHabit" DROP CONSTRAINT "GroupHabit_groupId_fkey";

-- DropIndex
DROP INDEX "GroupHabit_groupId_key";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "groupHabitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GroupHabit" DROP COLUMN "groupId";

-- CreateIndex
CREATE UNIQUE INDEX "Group_groupHabitId_key" ON "Group"("groupHabitId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_groupHabitId_fkey" FOREIGN KEY ("groupHabitId") REFERENCES "GroupHabit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
