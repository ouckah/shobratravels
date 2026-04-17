import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySquareWebhookSignature, getPaymentById } from "@/lib/square";
import {
  sendFinalPaymentReceipt,
  notifyPaymentReceived,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Square sends a variety of events, but we only care about payments whose
// status becomes COMPLETED on one of our balance-payment-link orders.
type SquareEvent = {
  type: string;
  data?: {
    type?: string;
    id?: string;
    object?: {
      payment?: {
        id?: string;
        order_id?: string;
        status?: string;
        amount_money?: { amount?: number; currency?: string };
        source_type?: string;
      };
    };
  };
};

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") || "";
  const notificationUrl =
    process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ||
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/square`;

  const valid = await verifySquareWebhookSignature({
    requestBody: raw,
    signatureHeader: signature,
    notificationUrl,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: SquareEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only react to payment events that are COMPLETED.
  const payment = event.data?.object?.payment;
  const isPaymentEvent =
    event.type === "payment.created" || event.type === "payment.updated";
  if (!isPaymentEvent || !payment?.id || payment.status !== "COMPLETED") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const orderId = payment.order_id;
  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: "no order_id" });
  }

  // Match this payment to a registration via the stored payment-link order ID.
  const registration = await prisma.registration.findUnique({
    where: { balancePaymentOrderId: orderId },
    include: { client: true, trip: true, tripDate: true },
  });
  if (!registration) {
    return NextResponse.json({ ok: true, ignored: "unknown order_id" });
  }

  // Idempotency — if we already recorded this payment, stop.
  const existing = await prisma.payment.findFirst({
    where: { squarePaymentId: payment.id },
  });
  if (existing) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  // Fetch the canonical payment object from Square (don't trust the webhook
  // payload for amounts — pull authoritative values).
  const authoritative = await getPaymentById(payment.id).catch(() => null);
  const amountCents = Number(
    authoritative?.amountMoney?.amount ?? payment.amount_money?.amount ?? 0,
  );
  const amount = amountCents / 100;
  const method =
    authoritative?.sourceType === "BANK_ACCOUNT" ? "ach" : "credit_card";

  await prisma.payment.create({
    data: {
      clientId: registration.clientId,
      registrationId: registration.id,
      amount,
      processingFee: 0,
      type: "FINAL",
      status: "COMPLETED",
      method,
      squarePaymentId: payment.id,
    },
  });

  await prisma.registration.update({
    where: { id: registration.id },
    data: { status: "FULLY_PAID" },
  });

  sendFinalPaymentReceipt({
    clientName: registration.client.fullName,
    clientEmail: registration.client.email,
    tripTitle: registration.trip.title,
    departureDate: registration.tripDate.departureDate,
    returnDate: registration.tripDate.returnDate,
    amount,
    paymentMethod: method,
    squarePaymentId: payment.id,
    paidAt: new Date(),
  }).catch(console.error);

  notifyPaymentReceived({
    clientName: registration.client.fullName,
    tripTitle: registration.trip.title,
    amount,
    method,
    type: "FINAL",
  }).catch(console.error);

  return NextResponse.json({ ok: true, recorded: true });
}
