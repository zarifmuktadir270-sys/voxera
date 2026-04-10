"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { email, password, name };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-lg">V</div>
            <span className="text-2xl font-bold">Voxera</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Build AI Voice Agents<br />
            <span className="text-purple-400">That Close Deals</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            Create, deploy, and manage intelligent voice agents for customer support,
            appointment booking, lead qualification, and more.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[["10ms", "Latency"], ["24/7", "Availability"], ["Free", "AI Models"]].map(([value, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold text-purple-400">{value}</div>
                <div className="text-zinc-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-lg">V</div>
            <span className="text-2xl font-bold">Voxera</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-zinc-400 mb-8">
            {mode === "login" ? "Sign in to manage your voice agents" : "Start building AI voice agents in minutes"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  placeholder="John Doe" required />
              </div>
            )}
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="Min 6 characters" minLength={6} required />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition disabled:opacity-50 cursor-pointer">
              {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-zinc-400 text-sm">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-purple-400 hover:text-purple-300 cursor-pointer">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
