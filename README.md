# Voxera - AI Voice Agent Platform

Build, deploy, and sell AI voice agents for customer support, appointment booking, lead qualification, and more.

## Features

- **Dashboard** - Create and manage multiple voice agents with custom prompts
- **Browser Voice Chat** - Test agents in the browser using speech recognition & synthesis
- **Phone Integration** - Connect Twilio phone numbers for real calls
- **Embeddable Widget** - Drop a script tag on any website to add a voice agent
- **Call Logs** - Full transcripts, summaries, and analytics
- **Free AI Models** - Powered by Groq (Llama 3.3 70B, Mixtral, Gemma)
- **Multi-tenant** - Each user gets their own agents and data

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS
- **Database**: Neon PostgreSQL + Drizzle ORM
- **AI**: Groq (free tier - Llama 3.3 70B)
- **Voice**: Browser Web Speech API + Twilio
- **Deployment**: Vercel

## Quick Start

```bash
git clone <your-repo>
cd voxera
npm install
cp .env.example .env.local
# Fill in your Neon DB URL, Groq key, etc.
npx drizzle-kit push
npm run dev
```

## Environment Variables

```
DATABASE_URL=postgresql://...@neon.tech/voxera
GROQ_API_KEY=gsk_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
JWT_SECRET=change-me
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add env vars in project settings
4. Deploy

## Selling to Clients

| Plan | Setup | Monthly | Includes |
|------|-------|---------|----------|
| Starter | $500 | $297/mo | 1 agent, 500 calls/mo |
| Pro | $1,500 | $597/mo | 3 agents, 2000 calls/mo |
| Enterprise | $3,000+ | $997+/mo | Unlimited, custom integrations |

### How to Ship

1. Deploy a separate instance per client or use multi-tenant
2. Give clients the widget embed code for their website
3. Buy a Twilio number and assign to their agent
4. Give them dashboard access to view call logs
