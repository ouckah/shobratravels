import { cookies } from "next/headers";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "admin_session";

export async function login(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  const cookieStore = await cookies();
  const token = Buffer.from(`${admin.id}:${Date.now()}`).toString("base64");
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days (604800 seconds)
  });

  return admin;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [adminId] = decoded.split(":");
    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });
    return admin;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
