import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
