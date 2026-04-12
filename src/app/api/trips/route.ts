import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const trips = await prisma.trip.findMany({
    where: { published: true },
    select: { id: true, slug: true, title: true, departureDate: true },
    orderBy: { departureDate: "asc" },
  });
  return NextResponse.json(trips);
}
