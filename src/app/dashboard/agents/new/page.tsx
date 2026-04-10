"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Best)" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Fastest)" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B" },
];

const VOICES = [
  { id: "alloy", name: "Alloy (Neutral)" },
  { id: "echo", name: "Echo (Male)" },
  { id: "fable", name: "Fable (British)" },
  { id: "onyx", name: "Onyx (Deep Male)" },
  { id: "nova", name: "Nova (Female)" },
  { id: "shimmer", name: "Shimmer (Warm Female)" },
];

const TEMPLATES = [
  {
    name: "Customer Support",
    systemPrompt: "You are a friendly and professional customer support agent. Help callers with their questions and issues. Be concise, empathetic, and solution-oriented. If you cannot resolve an issue, offer to escalate to a human agent. Always confirm the caller's issue before providing a solution.",
    greeting: "Hello! Thank you for calling. How can I help you today?",
  },
  {
    name: "Appointment Booking",
    systemPrompt: "You are an appointment booking assistant. Help callers schedule, reschedule, or cancel appointments. Ask for their name, preferred date and time, and the service they need. Confirm all details before finalizing. Be friendly and efficient.",
    greeting: "Hi there! I can help you book an appointment. What service are you looking for?",
  },
  {
    name: "Lead Qualification",
    systemPrompt: "You are a lead qualification agent. Your goal is to understand the caller's needs, budget, timeline, and decision-making authority. Ask open-ended questions to qualify them. Be conversational, not interrogative. Gather: company size, current solution, pain points, budget range, and timeline for implementation.",
    greeting: "Hi! Thanks for your interest. I'd love to learn more about your needs. Can you tell me a bit about your business?",
  },
  {
    name: "Custom",
    systemPrompt: "",
    greeting: "Hi, how can I help you today?",
  },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [greeting, setGreeting] = useState("Hi, how can I help you today?");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [voice, setVoice] = useState("nova");
  const [loading, setLoading] = useState(false);

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setSystemPrompt(t.systemPrompt);
    setGreeting(t.greeting);
    if (!name && t.name !== "Custom") setName(t.name + " Agent");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, systemPrompt, greeting, model, voice }),
    });

    if (res.ok) {
      const { agent } = await res.json();
      router.push(`/dashboard/agents/${agent.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Create New Agent</h1>
      <p className="text-zinc-400 mb-8">Configure your AI voice agent's behavior and personality</p>

      <div className="mb-8">
        <p className="text-sm text-zinc-400 mb-3">Start from a template:</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.name} onClick={() => applyTemplate(t)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition cursor-pointer">
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Agent Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
            placeholder="e.g., Customer Support Agent" required />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">System Prompt</label>
          <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={6}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition resize-none"
            placeholder="Describe how your agent should behave, what it knows, and how it should respond..." required />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Greeting Message</label>
          <input type="text" value={greeting} onChange={(e) => setGreeting(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
            placeholder="What the agent says when answering" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">AI Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition">
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Voice</label>
            <select value={voice} onChange={(e) => setVoice(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition">
              {VOICES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition disabled:opacity-50 cursor-pointer">
            {loading ? "Creating..." : "Create Agent"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
