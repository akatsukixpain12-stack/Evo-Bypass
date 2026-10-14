# Vercel Deployment Guide

Deploy the Next.js app in `frontend/` as a single Vercel project. Do not use the custom Express server as Vercel's entry point.

## Vercel project settings

1. Import `akatsukixpain12-stack/Evo-Bypass` into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set Framework Preset to **Next.js**.
4. Use the standard Next.js install/build settings; Vercel should run `npm install` and `npm run build` from `frontend/`.
5. Add `API_KEY` under Environment Variables only if the bulk API is needed. Keep it server-side, without a `NEXT_PUBLIC_` prefix.

No separate API deployment, custom Express server, or API URL environment variable is needed. The frontend calls same-origin `/api/*) routes.

## Verify after deployment

- `/` — homepage
- `/api/health` — API health
- `/api/supported` — supported service directory
- `/api/stats` — runtime counters
- `/api/test` — simple API check

## Important

Vercel API routes run serverlessly. In-memory statistics may reset or vary between invocations. For persistent counters, connect a database or durable analytics service. Link resolution depends on the external provider and may fail if that provider changes its flow.

For traditional local/server hosting, the Express app in `server/` is still available separately. It is not needed for the Vercel deployment.
