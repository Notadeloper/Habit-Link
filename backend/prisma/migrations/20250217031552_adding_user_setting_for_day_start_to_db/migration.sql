-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dayStart" TEXT NOT NULL DEFAULT '00:00',
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
