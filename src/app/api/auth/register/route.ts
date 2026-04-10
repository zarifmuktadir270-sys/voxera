import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { email, password, name, company } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(schema.users).values({ email, passwordHash, name, company }).returning();

  const token = createToken({ id: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  response.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 86400 });
  return response;
}
