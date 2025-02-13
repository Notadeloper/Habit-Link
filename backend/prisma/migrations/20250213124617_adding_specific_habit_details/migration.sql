/*
  Warnings:

  - You are about to drop the column `end_date` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `goal` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Habit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "end_date",
DROP COLUMN "goal",
DROP COLUMN "start_date",
ADD COLUMN     "goalStreak" INTEGER;
