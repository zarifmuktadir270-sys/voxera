"use client";

import { useEffect, useState } from "react";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [selectedCall, setSelectedCall] = useState<any>(null);

  useEffect(() => {
    fetch("/api/calls").then((r) => r.json()).then((d) => setCalls(d.calls || []));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Call Logs</h1>
      <p className="text-zinc-400 mb-8">View transcripts and analytics for all calls</p>

      <div className="flex gap-6">
        <div className="flex-1">
          {calls.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <p className="text-zinc-500">No calls yet. Test an agent to see calls here.</p>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Caller</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call) => (
                    <tr key={call.id} onClick={() => setSelectedCall(call)}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer transition">
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          call.source === "phone" ? "bg-blue-500/10 text-blue-400" :
                          call.source === "widget" ? "bg-purple-500/10 text-purple-400" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>{call.source}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{call.callerNumber || "Web User"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          call.status === "completed" ? "bg-green-500/10 text-green-400" :
                          call.status === "active" ? "bg-blue-500/10 text-blue-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>{call.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{call.duration ? `${call.duration}s` : "-"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{new Date(call.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedCall && (
          <div className="w-96 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 h-fit sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Call Details</h3>
              <button onClick={() => setSelectedCall(null)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">&times;</button>
            </div>
            {selectedCall.summary && (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 mb-1">Summary</p>
                <p className="text-sm">{selectedCall.summary}</p>
              </div>
            )}
            <div className="mb-4">
              <p className="text-xs text-zinc-500 mb-2">Transcript</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(selectedCall.transcript || []).map((m: any, i: number) => (
                  <div key={i} className={`text-sm p-2 rounded ${
                    m.role === "user" ? "bg-purple-500/10 text-purple-200" : "bg-zinc-800 text-zinc-300"
                  }`}>
                    <span className="text-xs text-zinc-500">{m.role}:</span> {m.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
