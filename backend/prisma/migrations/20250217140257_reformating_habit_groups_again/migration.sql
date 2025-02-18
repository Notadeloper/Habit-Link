/*
  Warnings:

  - You are about to drop the column `challengeHabitId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `HabitParticipation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,groupHabitId]` on the table `HabitParticipation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupHabitId` to the `HabitParticipation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_friend_id_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_challengeHabitId_fkey";

-- DropForeignKey
ALTER TABLE "HabitParticipation" DROP CONSTRAINT "HabitParticipation_groupId_fkey";

-- DropForeignKey
ALTER TABLE "HabitParticipation" DROP CONSTRAINT "HabitParticipation_habitId_fkey";

-- DropForeignKey
ALTER TABLE "HabitParticipation" DROP CONSTRAINT "HabitParticipation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Streak" DROP CONSTRAINT "Streak_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "Streak" DROP CONSTRAINT "Streak_user_id_fkey";

-- DropIndex
DROP INDEX "HabitParticipation_groupId_userId_key";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "challengeHabitId";

-- AlterTable
ALTER TABLE "HabitParticipation" DROP COLUMN "groupId",
ADD COLUMN     "groupHabitId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "GroupHabit" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "frequency_count" INTEGER NOT NULL,
    "frequency_period" "FrequencyPeriod" NOT NULL,
    "goalStreak" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupHabit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupHabit_groupId_key" ON "GroupHabit"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "HabitParticipation_userId_groupHabitId_key" ON "HabitParticipation"("userId", "groupHabitId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupHabit" ADD CONSTRAINT "GroupHabit_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitParticipation" ADD CONSTRAINT "HabitParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitParticipation" ADD CONSTRAINT "HabitParticipation_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitParticipation" ADD CONSTRAINT "HabitParticipation_groupHabitId_fkey" FOREIGN KEY ("groupHabitId") REFERENCES "GroupHabit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
