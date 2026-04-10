import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { getUserOrThrow } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserOrThrow();
  const { id } = await params;

  const [agent] = await db
    .select()
    .from(schema.agents)
    .where(and(eq(schema.agents.id, id), eq(schema.agents.userId, user.id)));

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ agent });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserOrThrow();
  const { id } = await params;
  const body = await req.json();

  const [agent] = await db
    .update(schema.agents)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(schema.agents.id, id), eq(schema.agents.userId, user.id)))
    .returning();

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ agent });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserOrThrow();
  const { id } = await params;

  await db
    .delete(schema.agents)
    .where(and(eq(schema.agents.id, id), eq(schema.agents.userId, user.id)));

  return NextResponse.json({ ok: true });
}
