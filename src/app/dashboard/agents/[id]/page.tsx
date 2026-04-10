"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [tab, setTab] = useState<"details" | "test" | "widget">("details");

  // Voice test state
  const [callActive, setCallActive] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/agents/${id}`).then((r) => r.json()).then((d) => {
      setAgent(d.agent);
      setForm(d.agent);
    });
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function saveAgent() {
    const res = await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const { agent: updated } = await res.json();
      setAgent(updated);
      setEditing(false);
    }
  }

  async function deleteAgent() {
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    router.push("/dashboard/agents");
  }

  async function startCall() {
    const res = await fetch("/api/voice/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: id }),
    });
    const { call, greeting } = await res.json();
    setCallId(call.id);
    setCallActive(true);
    setMessages([{ role: "assistant", content: greeting }]);
    speak(greeting);
  }

  async function endCall() {
    if (callId) {
      await fetch("/api/voice/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      });
    }
    setCallActive(false);
    setCallId(null);
    stopListening();
    window.speechSynthesis?.cancel();
  }

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    setIsSpeaking(true);
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en"));
    if (preferred) utter.voice = preferred;
    utter.onend = () => {
      setIsSpeaking(false);
      if (callActive) startListening();
    };
    window.speechSynthesis.speak(utter);
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = agent?.language || "en-US";

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      setTranscript(result[0].transcript);
      if (result.isFinal) {
        const text = result[0].transcript;
        setTranscript("");
        handleUserMessage(text);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function handleUserMessage(text: string) {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);

    const chatMessages = newMessages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const res = await fetch("/api/voice/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: id, messages: chatMessages, callId }),
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    let fullText = "";
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") break;
        try {
          const { text: t } = JSON.parse(data);
          fullText += t;
        } catch {}
      }
    }

    setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
    speak(fullText);
  }

  if (!agent) return <div className="p-8 text-zinc-400">Loading...</div>;

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const widgetCode = `<script src="${appUrl}/widget.js" data-agent-id="${id}"></script>`;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${agent.active ? "bg-green-500" : "bg-zinc-600"}`} />
          <h1 className="text-2xl font-bold">{agent.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={deleteAgent}
            className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition cursor-pointer">
            Delete
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-lg p-1 w-fit">
        {(["details", "test", "widget"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm transition cursor-pointer capitalize ${
              tab === t ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
            }`}>
            {t === "test" ? "Test Call" : t}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Agent Name</label>
            <input type="text" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">System Prompt</label>
            <textarea value={form.systemPrompt || ""} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              disabled={!editing} rows={6}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition disabled:opacity-60 resize-none" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Greeting</label>
            <input type="text" value={form.greeting || ""} onChange={(e) => setForm({ ...form, greeting: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition disabled:opacity-60" />
          </div>
          <div className="flex gap-3 pt-2">
            {editing ? (
              <>
                <button onClick={saveAgent} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition cursor-pointer">Save</button>
                <button onClick={() => { setForm(agent); setEditing(false); }} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition cursor-pointer">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition cursor-pointer">Edit Agent</button>
            )}
          </div>
        </div>
      )}

      {tab === "test" && (
        <div className="max-w-2xl">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-purple-600 text-white rounded-br-md"
                      : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {transcript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm bg-purple-600/30 text-purple-200 rounded-br-md italic">
                    {transcript}...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-zinc-800 p-4 flex items-center justify-center gap-4">
              {!callActive ? (
                <button onClick={startCall}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 rounded-full font-medium transition cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Start Test Call
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    {isListening && (
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        Listening...
                      </div>
                    )}
                    {isSpeaking && (
                      <div className="flex items-center gap-2 text-blue-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        Speaking...
                      </div>
                    )}
                  </div>
                  <button onClick={endCall}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-medium transition cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    End Call
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3 text-center">
            Uses your browser's microphone and speakers. Allow microphone access when prompted.
          </p>
        </div>
      )}

      {tab === "widget" && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Embed on Your Website</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Add this script tag to your website to embed a voice agent widget that your visitors can interact with.
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <code className="text-sm text-green-400 break-all">{widgetCode}</code>
            </div>
            <button onClick={() => navigator.clipboard.writeText(widgetCode)}
              className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition cursor-pointer">
              Copy Code
            </button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">API Endpoint</h3>
            <p className="text-zinc-400 text-sm mb-4">Use this endpoint to integrate voice chat into your own application.</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="text-purple-400">POST</span> <code className="text-green-400">{appUrl}/api/voice/start</code></p>
              <p className="text-xs text-zinc-500">Body: {`{ "agentId": "${id}" }`}</p>
              <p className="text-sm mt-3"><span className="text-purple-400">POST</span> <code className="text-green-400">{appUrl}/api/voice/chat</code></p>
              <p className="text-xs text-zinc-500">Body: {`{ "agentId": "${id}", "messages": [...], "callId": "..." }`}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Twilio Phone Integration</h3>
            <p className="text-zinc-400 text-sm">
              To connect a phone number, configure your Twilio number's webhook to:
            </p>
            <code className="block mt-2 text-sm text-green-400 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              {appUrl}/api/twilio/incoming
            </code>
            <p className="text-zinc-500 text-xs mt-2">
              Then update this agent's Twilio phone number in the settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
