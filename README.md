# TogetherBooth

A Next.js + TypeScript foundation for an online long-distance photobooth, with a polished interactive prototype preserved during the migration.

## Run locally

Install dependencies and start Next.js:

```powershell
npm install
npm run dev
```

Then open `http://localhost:3000`. Copy `.env.example` to `.env.local` and fill the Supabase and LiveKit values to enable the real backend. Without credentials, the existing demo flow remains available.

## Included flow

- Responsive landing page
- Create or join a private room
- Five frame styles
- Real browser camera permission and preview
- Demo remote participant
- Four-photo timed capture sequence
- Generated photostrip preview and PNG download
- Retake and native share actions

## Production foundation

- Next.js App Router, TypeScript, Tailwind CSS, and a shadcn-style component utility
- Typed Supabase browser/server/admin clients
- Postgres schema, RLS policies, private Storage bucket, and expiry function
- Supabase Presence/Broadcast event contracts
- Server-only LiveKit token endpoint
- Optional PostHog provider

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for boundaries and the remaining screen-by-screen migration.
