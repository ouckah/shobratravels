import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notifyPaymentReceived } from "@/lib/email";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { status } = await req.json();

  const payment = await prisma.payment.update({
    where: { id },
    data: { status },
  });

  if (status === "COMPLETED") {
    const paymentWithDetails = await prisma.payment.findUnique({
      where: { id },
      include: {
        client: { select: { fullName: true } },
        registration: { include: { trip: { select: { title: true } } } },
      },
    });

    if (paymentWithDetails) {
      notifyPaymentReceived({
        clientName: paymentWithDetails.client.fullName,
        tripTitle: paymentWithDetails.registration.trip.title,
        amount: paymentWithDetails.amount,
        method: paymentWithDetails.method,
        type: paymentWithDetails.type,
      }).catch(console.error);
    }

    const allPayments = await prisma.payment.findMany({
      where: { registrationId: payment.registrationId },
    });
    const allCompleted = allPayments.every((p) => p.status === "COMPLETED");
    const hasDeposit = allPayments.some(
      (p) => p.type === "DEPOSIT" && p.status === "COMPLETED"
    );

    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: {
        status: allCompleted ? "FULLY_PAID" : hasDeposit ? "DEPOSIT_PAID" : "PENDING",
      },
    });
  }

  return NextResponse.json(payment);
}
