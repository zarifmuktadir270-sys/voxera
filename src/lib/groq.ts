import Groq from "groq-sdk";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
}

export async function chatCompletion(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  model = "llama-3.3-70b-versatile"
) {
  const response = await getGroq().chat.completions.create({
    model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 300,
  });
  return response.choices[0]?.message?.content || "";
}

export async function streamChatCompletion(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  model = "llama-3.3-70b-versatile"
) {
  return getGroq().chat.completions.create({
    model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 300,
    stream: true,
  });
}
