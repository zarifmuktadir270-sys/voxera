import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { chatCompletion } from "@/lib/groq";

// Twilio sends POST to this webhook when a call comes in
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const callerNumber = formData.get("From") as string;
  const calledNumber = formData.get("To") as string;
  const callSid = formData.get("CallSid") as string;
  const speechResult = formData.get("SpeechResult") as string | null;
  const callId = req.nextUrl.searchParams.get("callId");

  // Find agent by phone number
  const [agent] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.twilioPhoneNumber, calledNumber));

  if (!agent) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response><Say>Sorry, this number is not configured. Goodbye.</Say><Hangup/></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

  // First call - no speech yet
  if (!speechResult && !callId) {
    // Create call record
    const [call] = await db
      .insert(schema.calls)
      .values({
        agentId: agent.id,
        callerNumber,
        source: "phone",
        status: "active",
        twilioCallSid: callSid,
        transcript: [],
      })
      .returning();

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Google.en-US-Standard-C">${escapeXml(agent.greeting)}</Say>
        <Gather input="speech" action="${appUrl}/api/twilio/incoming?callId=${call.id}" method="POST" speechTimeout="auto" language="${agent.language}">
          <Say voice="Google.en-US-Standard-C">Please go ahead.</Say>
        </Gather>
      </Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  // Subsequent turns - process speech
  if (speechResult && callId) {
    const [call] = await db.select().from(schema.calls).where(eq(schema.calls.id, callId));
    const transcript = (call?.transcript || []) as { role: string; content: string; timestamp: string }[];

    const messages = transcript.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    messages.push({ role: "user", content: speechResult });

    const aiResponse = await chatCompletion(agent.systemPrompt, messages, agent.model);

    transcript.push(
      { role: "user", content: speechResult, timestamp: new Date().toISOString() },
      { role: "assistant", content: aiResponse, timestamp: new Date().toISOString() }
    );
    await db.update(schema.calls).set({ transcript }).where(eq(schema.calls.id, callId));

    // Check for goodbye intent
    const isGoodbye = /\b(bye|goodbye|that's all|hang up|end call|thank you.*bye)\b/i.test(speechResult);

    if (isGoodbye) {
      await db
        .update(schema.calls)
        .set({ status: "completed", endedAt: new Date() })
        .where(eq(schema.calls.id, callId));

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="Google.en-US-Standard-C">${escapeXml(aiResponse)}</Say>
          <Hangup/>
        </Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Google.en-US-Standard-C">${escapeXml(aiResponse)}</Say>
        <Gather input="speech" action="${appUrl}/api/twilio/incoming?callId=${callId}" method="POST" speechTimeout="auto" language="${agent.language}">
        </Gather>
      </Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
    <Response><Say>Something went wrong. Goodbye.</Say><Hangup/></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
