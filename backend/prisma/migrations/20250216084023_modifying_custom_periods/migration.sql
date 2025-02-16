/*
  Warnings:

  - The values [custom] on the enum `FrequencyPeriod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `custom_period` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `HabitTracking` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FrequencyPeriod_new" AS ENUM ('day', 'week', 'month');
ALTER TABLE "Habit" ALTER COLUMN "frequency_period" TYPE "FrequencyPeriod_new" USING ("frequency_period"::text::"FrequencyPeriod_new");
ALTER TABLE "GroupHabitProposal" ALTER COLUMN "frequency_period" TYPE "FrequencyPeriod_new" USING ("frequency_period"::text::"FrequencyPeriod_new");
ALTER TYPE "FrequencyPeriod" RENAME TO "FrequencyPeriod_old";
ALTER TYPE "FrequencyPeriod_new" RENAME TO "FrequencyPeriod";
DROP TYPE "FrequencyPeriod_old";
COMMIT;

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "custom_period";

-- AlterTable
ALTER TABLE "HabitTracking" DROP COLUMN "status";
