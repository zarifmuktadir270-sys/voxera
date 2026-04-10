import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { agentId, source = "web", callerNumber } = await req.json();

  const [agent] = await db.select().from(schema.agents).where(eq(schema.agents.id, agentId));
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const [call] = await db
    .insert(schema.calls)
    .values({
      agentId,
      source,
      callerNumber,
      status: "active",
      transcript: [],
    })
    .returning();

  return NextResponse.json({ call, greeting: agent.greeting });
}
