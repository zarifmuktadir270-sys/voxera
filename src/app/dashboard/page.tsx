"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardOverview() {
  const [agents, setAgents] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/agents").then((r) => r.json()).then((d) => setAgents(d.agents || []));
    fetch("/api/calls").then((r) => r.json()).then((d) => setCalls(d.calls || []));
  }, []);

  const totalCalls = calls.length;
  const activeCalls = calls.filter((c) => c.status === "active").length;
  const avgDuration = calls.length > 0
    ? Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length)
    : 0;

  const stats = [
    { label: "Active Agents", value: agents.filter((a) => a.active).length, color: "text-purple-400" },
    { label: "Total Calls", value: totalCalls, color: "text-blue-400" },
    { label: "Active Now", value: activeCalls, color: "text-green-400" },
    { label: "Avg Duration", value: `${avgDuration}s`, color: "text-amber-400" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Overview of your voice agent platform</p>
        </div>
        <Link href="/dashboard/agents/new"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
          + New Agent
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Your Agents</h2>
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-3">No agents yet</p>
              <Link href="/dashboard/agents/new" className="text-purple-400 hover:text-purple-300 text-sm">
                Create your first agent
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.slice(0, 5).map((agent) => (
                <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${agent.active ? "bg-green-500" : "bg-zinc-600"}`} />
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <span className="text-zinc-500 text-sm">{agent.model}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Calls</h2>
          {calls.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No calls yet</p>
          ) : (
            <div className="space-y-3">
              {calls.slice(0, 5).map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
                  <div>
                    <span className="text-sm font-medium">{call.source === "phone" ? call.callerNumber : "Web Call"}</span>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(call.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      call.status === "completed" ? "bg-green-500/10 text-green-400" :
                      call.status === "active" ? "bg-blue-500/10 text-blue-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>{call.status}</span>
                    {call.duration > 0 && <p className="text-xs text-zinc-500 mt-1">{call.duration}s</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
