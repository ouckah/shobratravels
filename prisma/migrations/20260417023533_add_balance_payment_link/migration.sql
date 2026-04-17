-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "balancePaymentLinkUrl" TEXT;
ALTER TABLE "Registration" ADD COLUMN     "balancePaymentLinkId"  TEXT;
ALTER TABLE "Registration" ADD COLUMN     "balancePaymentOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Registration_balancePaymentOrderId_key" ON "Registration"("balancePaymentOrderId");
