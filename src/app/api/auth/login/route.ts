import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createToken({ id: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  response.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 86400 });
  return response;
}
