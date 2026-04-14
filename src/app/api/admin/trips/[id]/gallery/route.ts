import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  if (!Array.isArray(body.galleryImages)) {
    return NextResponse.json({ error: "galleryImages must be an array" }, { status: 400 });
  }

  const trip = await prisma.trip.update({
    where: { id },
    data: { galleryImages: body.galleryImages as string[] },
    select: { id: true, galleryImages: true },
  });

  return NextResponse.json(trip);
}
