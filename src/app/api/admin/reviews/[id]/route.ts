import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendReviewApproved } from "@/lib/email";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { approved } = await req.json();

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const review = await prisma.review.update({
    where: { id },
    data: { approved },
  });

  const becameApproved = approved === true && existing.approved === false;
  if (becameApproved && review.email) {
    sendReviewApproved({
      reviewerName: review.name,
      reviewerEmail: review.email,
      rating: review.rating,
    }).catch(console.error);
  }

  return NextResponse.json(review);
}

export async function DELETE(_req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  await prisma.review.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
