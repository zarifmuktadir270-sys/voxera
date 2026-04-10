"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/agents").then((r) => r.json()).then((d) => setAgents(d.agents || []));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Voice Agents</h1>
          <p className="text-zinc-400 mt-1">Create and manage your AI voice agents</p>
        </div>
        <Link href="/dashboard/agents/new"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
          + New Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No agents yet</h3>
          <p className="text-zinc-400 mb-6">Create your first voice agent to start handling calls</p>
          <Link href="/dashboard/agents/new"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
            Create Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/50 transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${agent.active ? "bg-green-500" : "bg-zinc-600"}`} />
                  <h3 className="font-semibold group-hover:text-purple-400 transition">{agent.name}</h3>
                </div>
              </div>
              <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{agent.systemPrompt}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="bg-zinc-800 px-2 py-1 rounded">{agent.model}</span>
                <span>{agent.voice}</span>
                <span>{agent.language}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
