import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processPayment, calculateTotal } from "@/lib/square";
import { notifyPaymentReceived } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { sourceId, registrationId } = await req.json();

    if (!sourceId || !registrationId) {
      return NextResponse.json(
        { error: "Missing payment source or registration" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        client: true,
        trip: { select: { title: true } },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const { deposit, fee, total } = calculateTotal(registration.paymentMethod);

    const squarePayment = await processPayment(
      sourceId,
      registration.paymentMethod,
      registration.client.email
    );

    // Update the pending payment record
    await prisma.payment.updateMany({
      where: {
        registrationId: registration.id,
        type: "DEPOSIT",
        status: "PENDING",
      },
      data: {
        status: "COMPLETED",
        amount: deposit,
        processingFee: fee,
        squarePaymentId: squarePayment?.id || null,
      },
    });

    // Update registration status
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: "DEPOSIT_PAID" },
    });

    notifyPaymentReceived({
      clientName: registration.client.fullName,
      tripTitle: registration.trip.title,
      amount: total,
      method: registration.paymentMethod,
      type: "DEPOSIT",
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      paymentId: squarePayment?.id,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Payment failed. Please try again." },
      { status: 500 }
    );
  }
}
