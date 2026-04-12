import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, content, rating } = await req.json();

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and review are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        fullName: { contains: name, mode: "insensitive" },
      },
    });

    await prisma.review.create({
      data: {
        name,
        content,
        rating: Math.min(5, Math.max(1, rating || 5)),
        clientId: client?.id || null,
        approved: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
