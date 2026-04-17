-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "balanceReminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "email" TEXT;
