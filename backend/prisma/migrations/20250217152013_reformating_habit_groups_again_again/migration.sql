/*
  Warnings:

  - You are about to drop the column `conversationId` on the `Group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropIndex
DROP INDEX "Group_conversationId_key";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "groupId" TEXT;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "conversationId";

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_groupId_key" ON "Conversation"("groupId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
