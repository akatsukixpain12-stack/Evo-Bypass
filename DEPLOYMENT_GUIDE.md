# EVO Bypass Deployment Guide

This project already has one Express API in \`server/\` and one Next.js frontend in \`frontend/\`. Deploy those existing parts; do not create an additional proxy server.

## Local development

Requires Node.js and npm.

\`\`\`bash
npm install
npm run dev
\`\`\`

- Frontend: \`http://localhost:3001\`
- API: \`http://localhost:3000\`
- API health check: \`http://localhost:3000/api/health\`

The frontend uses port 3001 in development so it does not collide with the API on port 3000. On Windows, \`start.bat\` starts both.

## Deploy the API

Use Railway, Render, or another Node.js web-service host.

- **Root directory:** \`server\`
- **Build/install command:** \`npm install\`
- **Start command:** \`npm start\`

Set the API service's environment variables:

\`\`\`env
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.example
API_KEY=choose-a-private-server-side-key
\`\`\`

Allow the host to provide \`PORT\` when it requires one. The API defaults to port 3000 for local development. Set \`CORS_ORIGIN\` to the exact browser-facing frontend origin; avoid using a wildcard for a public production API.

After deployment, check \`https://your-api-domain.example/api/health\`.

## Deploy the Next.js frontend

Deploy \`frontend/\` to Vercel or a host that supports Next.js.

- **Root directory:** \`frontend\`
- **Build command:** \`npm install && npm run build\`
- **Start command for a Node web service:** \`npm start\`

Set the following environment variable **before the frontend build**:

\`\`\`env
NEXT_PUBLIC_SITE_NAME=Evo Bypass
NEXT_PUBLIC_API_URL=https://your-api-domain.example
\`\`\`

Replace the example URL with the deployed API origin, with no trailing \`/api\` path. The frontend appends \`/api/health\`, \`/api/supported\`, \`/api/stats\`, and \`/api/bypass\` automatically. If the API address changes, update the environment variable and rebuild/redeploy the frontend.

Also set the API's \`CORS_ORIGIN\` to your frontend domain. Do not set API secrets as \`NEXT_PUBLIC_*\` variables.

## Root static page

The root \`index.html\` is a standalone fallback page and uses the same API. When it is hosted on the same origin as the API, it calls \`/api\` on that origin. When it is hosted separately, set \`window.EVO_API_URL\` to the API origin in a script before the page's main script runs.

## Troubleshooting

### Frontend says the resolver is offline

1. Open \`/api/health\` on the deployed API domain.
2. Check \`NEXT_PUBLIC_API_URL\` in the frontend hosting settings and rebuild the frontend after changing it.
3. Check that the API's \`CORS_ORIGIN\` exactly matches the deployed frontend origin.

### Port 3000 is already in use locally

Keep the API on port 3000 and the frontend on port 3001. Stop any older development process using one of those ports before restarting.

### A particular link does not resolve

Provider link flows change frequently. A healthy API does not mean every provider-specific link can be resolved; show the returned error and use the provider's supported/authorized flow when necessary.

## Existing API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | \`/api/health\` | API health |
| GET | \`/api/stats\` | Live in-memory counters |
| GET | \`/api/supported\` | Service catalog |
| POST | \`/api/bypass\` | Resolve one URL |
| POST | \`/api/bypass/bulk\` | Bulk requests (API key required) |
