import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyNewContactMessage, sendContactReceived } from "@/lib/email";
import { checkLimit, getClientIp, limiters } from "@/lib/ratelimit";
import { contactSchema, formatZodError } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const limit = await checkLimit(limiters.contact, `contact:${getClientIp(req)}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { name, email, message } = parsed.data;

    const client = await prisma.client.findUnique({ where: { email } });

    await prisma.message.create({
      data: {
        name,
        email,
        message,
        clientId: client?.id || null,
      },
    });

    notifyNewContactMessage({ name, email, message }).catch(console.error);
    sendContactReceived({ name, email, message }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
