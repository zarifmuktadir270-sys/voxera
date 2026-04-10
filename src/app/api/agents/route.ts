import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { getUserOrThrow } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getUserOrThrow();
  const agentList = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.userId, user.id))
    .orderBy(desc(schema.agents.createdAt));
  return NextResponse.json({ agents: agentList });
}

export async function POST(req: NextRequest) {
  const user = await getUserOrThrow();
  const body = await req.json();

  const [agent] = await db
    .insert(schema.agents)
    .values({
      userId: user.id,
      name: body.name,
      systemPrompt: body.systemPrompt,
      greeting: body.greeting || "Hi, how can I help you today?",
      voice: body.voice || "alloy",
      model: body.model || "llama-3.3-70b-versatile",
      language: body.language || "en",
      maxCallDuration: body.maxCallDuration || 300,
    })
    .returning();

  return NextResponse.json({ agent }, { status: 201 });
}
