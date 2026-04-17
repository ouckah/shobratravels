import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBalanceDueReminder } from "@/lib/email";

// Fire reminders when a trip is ~30 days out (window: 28–32 days).
const WINDOW_START_DAYS = 28;
const WINDOW_END_DAYS = 32;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + WINDOW_START_DAYS * 86_400_000);
  const windowEnd = new Date(now.getTime() + WINDOW_END_DAYS * 86_400_000);

  const registrations = await prisma.registration.findMany({
    where: {
      status: "DEPOSIT_PAID",
      balanceReminderSentAt: null,
      tripDate: {
        departureDate: { gte: windowStart, lte: windowEnd },
      },
    },
    include: {
      client: true,
      trip: true,
      tripDate: true,
      payments: { where: { status: "COMPLETED" } },
    },
  });

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const reg of registrations) {
    try {
      const paid = reg.payments
        .filter((p) => p.type !== "REFUND")
        .reduce((sum, p) => sum + p.amount, 0);
      const refunded = reg.payments
        .filter((p) => p.type === "REFUND")
        .reduce((sum, p) => sum + p.amount, 0);
      const balanceDue = Math.max(0, reg.trip.pricePerPerson - (paid - refunded));
      if (balanceDue <= 0) {
        await prisma.registration.update({
          where: { id: reg.id },
          data: { balanceReminderSentAt: now },
        });
        results.push({ id: reg.id, ok: true });
        continue;
      }

      const daysUntilDeparture = Math.round(
        (reg.tripDate.departureDate.getTime() - now.getTime()) / 86_400_000,
      );

      await sendBalanceDueReminder({
        clientName: reg.client.fullName,
        clientEmail: reg.client.email,
        tripTitle: reg.trip.title,
        departureDate: reg.tripDate.departureDate,
        returnDate: reg.tripDate.returnDate,
        balanceDue,
        daysUntilDeparture,
      });

      await prisma.registration.update({
        where: { id: reg.id },
        data: { balanceReminderSentAt: now },
      });

      results.push({ id: reg.id, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`balance reminder failed for ${reg.id}:`, err);
      results.push({ id: reg.id, ok: false, error: msg });
    }
  }

  return NextResponse.json({
    processed: registrations.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
