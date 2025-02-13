/*
  Warnings:

  - You are about to drop the column `group_id` on the `Habit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Habit" DROP CONSTRAINT "Habit_group_id_fkey";

-- DropForeignKey
ALTER TABLE "HabitTracking" DROP CONSTRAINT "HabitTracking_habit_id_fkey";

-- DropIndex
DROP INDEX "Habit_group_id_idx";

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "group_id";

-- CreateTable
CREATE TABLE "HabitGroup" (
    "habitId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GroupHabitProposal" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency_period" "FrequencyPeriod" NOT NULL,
    "proposerId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupHabitProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupHabitAgreement" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "decision" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupHabitAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HabitGroup_habitId_groupId_key" ON "HabitGroup"("habitId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupHabitAgreement_proposalId_userId_key" ON "GroupHabitAgreement"("proposalId", "userId");

-- AddForeignKey
ALTER TABLE "HabitTracking" ADD CONSTRAINT "HabitTracking_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitGroup" ADD CONSTRAINT "HabitGroup_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitGroup" ADD CONSTRAINT "HabitGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupHabitProposal" ADD CONSTRAINT "GroupHabitProposal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupHabitProposal" ADD CONSTRAINT "GroupHabitProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupHabitAgreement" ADD CONSTRAINT "GroupHabitAgreement_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GroupHabitProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupHabitAgreement" ADD CONSTRAINT "GroupHabitAgreement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
