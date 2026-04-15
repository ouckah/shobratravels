import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { checkLimit, getClientIp, limiters } from "@/lib/ratelimit";
import { adminLoginSchema, formatZodError } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await checkLimit(limiters.adminLogin, `adminLogin:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const admin = await login(parsed.data.email, parsed.data.password);
  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
