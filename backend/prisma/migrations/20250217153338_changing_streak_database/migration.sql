/*
  Warnings:

  - A unique constraint covering the columns `[habit_id]` on the table `Streak` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Streak_habit_id_idx";

-- DropIndex
DROP INDEX "Streak_habit_id_user_id_key";

-- DropIndex
DROP INDEX "Streak_user_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Streak_habit_id_key" ON "Streak"("habit_id");
