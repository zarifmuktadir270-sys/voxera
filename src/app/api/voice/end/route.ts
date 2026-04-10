import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { chatCompletion } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const { callId } = await req.json();

  const [call] = await db.select().from(schema.calls).where(eq(schema.calls.id, callId));
  if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 });

  // Generate summary from transcript
  const transcript = (call.transcript || []) as { role: string; content: string }[];
  let summary = "";
  if (transcript.length > 0) {
    const convo = transcript.map((m) => `${m.role}: ${m.content}`).join("\n");
    summary = await chatCompletion(
      "Summarize this call in 2-3 sentences. Include the caller's intent and outcome.",
      [{ role: "user", content: convo }],
      "llama-3.3-70b-versatile"
    );
  }

  const duration = Math.round((Date.now() - new Date(call.createdAt).getTime()) / 1000);

  await db
    .update(schema.calls)
    .set({ status: "completed", duration, summary, endedAt: new Date() })
    .where(eq(schema.calls.id, callId));

  return NextResponse.json({ ok: true, summary, duration });
}
