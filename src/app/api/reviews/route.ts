import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyNewReview } from "@/lib/email";
import { checkLimit, getClientIp, limiters } from "@/lib/ratelimit";
import { reviewSchema, formatZodError } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const limit = await checkLimit(limiters.review, `review:${getClientIp(req)}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many reviews submitted. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { name, content } = parsed.data;
    const rating = parsed.data.rating ?? 5;

    const client = await prisma.client.findFirst({
      where: {
        fullName: { contains: name, mode: "insensitive" },
      },
    });

    await prisma.review.create({
      data: {
        name,
        content,
        rating,
        clientId: client?.id || null,
        approved: false,
      },
    });

    notifyNewReview({
      reviewerName: name,
      rating,
      content,
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
