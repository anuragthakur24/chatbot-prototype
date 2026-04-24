-- AlterTable
ALTER TABLE "ChatLog" ADD COLUMN     "confidence" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "ChatLog" ADD CONSTRAINT "ChatLog_empId_fkey" FOREIGN KEY ("empId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
