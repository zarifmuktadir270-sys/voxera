import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { getUserOrThrow } from "@/lib/auth";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getUserOrThrow();
  const agentId = req.nextUrl.searchParams.get("agentId");

  // Get user's agent IDs
  const userAgents = await db
    .select({ id: schema.agents.id })
    .from(schema.agents)
    .where(eq(schema.agents.userId, user.id));

  const agentIds = userAgents.map((a) => a.id);
  if (agentIds.length === 0) return NextResponse.json({ calls: [] });

  let query = db
    .select()
    .from(schema.calls)
    .where(
      agentId
        ? and(eq(schema.calls.agentId, agentId), inArray(schema.calls.agentId, agentIds))
        : inArray(schema.calls.agentId, agentIds)
    )
    .orderBy(desc(schema.calls.createdAt))
    .limit(50);

  const callList = await query;
  return NextResponse.json({ calls: callList });
}
