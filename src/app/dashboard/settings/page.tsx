"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-zinc-400 mb-8">Configure your platform integrations</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 text-sm">G</span>
            Groq API (AI Models)
          </h2>
          <p className="text-sm text-zinc-400 mb-3">
            Free tier includes Llama 3.3 70B, Mixtral, and more. Get your key at{" "}
            <a href="https://console.groq.com" target="_blank" className="text-purple-400 hover:text-purple-300">console.groq.com</a>
          </p>
          <input type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
            placeholder="gsk_..." />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-sm">T</span>
            Twilio (Phone Calls)
          </h2>
          <p className="text-sm text-zinc-400 mb-3">
            Connect a phone number for real phone calls. Get a free trial at{" "}
            <a href="https://www.twilio.com" target="_blank" className="text-purple-400 hover:text-purple-300">twilio.com</a>
          </p>
          <div className="space-y-3">
            <input type="text" value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
              placeholder="Account SID (ACxxxxxxx)" />
            <input type="password" value={twilioToken} onChange={(e) => setTwilioToken(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
              placeholder="Auth Token" />
            <input type="tel" value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition"
              placeholder="Phone Number (+1234567890)" />
          </div>
        </section>

        <div className="flex items-center gap-4 pt-4">
          <button onClick={() => setSaved(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition cursor-pointer">
            Save Settings
          </button>
          {saved && <span className="text-green-400 text-sm">Settings saved! Set these as environment variables in your Vercel project.</span>}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mt-8">
          <h3 className="font-semibold mb-2">Environment Variables</h3>
          <p className="text-sm text-zinc-400 mb-3">Set these in your Vercel project settings or .env file:</p>
          <pre className="text-xs text-green-400 bg-black/50 p-4 rounded-lg overflow-x-auto">{`GROQ_API_KEY=gsk_your_key
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`}</pre>
        </div>
      </div>
    </div>
  );
}
