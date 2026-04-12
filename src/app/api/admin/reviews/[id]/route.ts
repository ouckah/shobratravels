import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { approved } = await req.json();

  const review = await prisma.review.update({
    where: { id },
    data: { approved },
  });

  return NextResponse.json(review);
}

export async function DELETE(_req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  await prisma.review.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
