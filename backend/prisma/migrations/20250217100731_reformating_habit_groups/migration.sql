/*
  Warnings:

  - You are about to drop the `GroupHabitAgreement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupHabitProposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HabitGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupHabitAgreement" DROP CONSTRAINT "GroupHabitAgreement_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "GroupHabitAgreement" DROP CONSTRAINT "GroupHabitAgreement_userId_fkey";

-- DropForeignKey
ALTER TABLE "GroupHabitProposal" DROP CONSTRAINT "GroupHabitProposal_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupHabitProposal" DROP CONSTRAINT "GroupHabitProposal_proposerId_fkey";

-- DropForeignKey
ALTER TABLE "HabitGroup" DROP CONSTRAINT "HabitGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "HabitGroup" DROP CONSTRAINT "HabitGroup_habitId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "challengeHabitId" TEXT;

-- DropTable
DROP TABLE "GroupHabitAgreement";

-- DropTable
DROP TABLE "GroupHabitProposal";

-- DropTable
DROP TABLE "HabitGroup";

-- CreateTable
CREATE TABLE "HabitParticipation" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HabitParticipation_groupId_userId_key" ON "HabitParticipation"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_challengeHabitId_fkey" FOREIGN KEY ("challengeHabitId") REFERENCES "Habit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitParticipation" ADD CONSTRAINT "HabitParticipation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitParticipation" ADD CONSTRAINT "HabitParticipation_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitParticipation" ADD CONSTRAINT "HabitParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
