import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { streamChatCompletion } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const { agentId, messages, callId } = await req.json();

  if (!agentId || !messages) {
    return NextResponse.json({ error: "Missing agentId or messages" }, { status: 400 });
  }

  const [agent] = await db.select().from(schema.agents).where(eq(schema.agents.id, agentId));
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const stream = await streamChatCompletion(agent.systemPrompt, messages, agent.model);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }

      // Save to call transcript if callId provided
      if (callId) {
        const [call] = await db.select().from(schema.calls).where(eq(schema.calls.id, callId));
        if (call) {
          const transcript = (call.transcript || []) as { role: string; content: string; timestamp: string }[];
          const lastUserMsg = messages[messages.length - 1];
          transcript.push(
            { role: "user", content: lastUserMsg.content, timestamp: new Date().toISOString() },
            { role: "assistant", content: fullResponse, timestamp: new Date().toISOString() }
          );
          await db.update(schema.calls).set({ transcript }).where(eq(schema.calls.id, callId));
        }
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
