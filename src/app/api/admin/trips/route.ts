import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const trip = await prisma.trip.create({
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description,
      destinations: body.destinations,
      duration: body.duration,
      departureDate: new Date(body.departureDate),
      returnDate: new Date(body.returnDate),
      groupSize: body.groupSize || null,
      pricePerPerson: body.pricePerPerson,
      singleSupplement: body.singleSupplement || null,
      inclusions: body.inclusions || null,
      exclusions: body.exclusions || null,
      heroImage: body.heroImage || null,
      pdfUrl: body.pdfUrl || null,
      published: body.published,
      featured: body.featured,
    },
  });

  return NextResponse.json(trip);
}
