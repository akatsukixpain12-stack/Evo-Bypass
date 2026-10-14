# EVO Bypass

EVO Bypass is a responsive link-resolver interface with a searchable service directory and a small JSON API.

## What's included

- Gemini-inspired interface with springy motion and mobile-friendly controls
- Link form with URL validation, visible loading/errors, result copy/open actions
- Searchable directory loaded from the API
- API health and live statistics display
- Existing Express API under \`server/\` and Next.js frontend under \`frontend/\`

The UI uses the existing API. It does not add another proxy or backend. Supported links can stop working when the provider changes its flow; the app reports resolver errors instead of pretending every link will succeed.

## Run locally

Install [Node.js](https://nodejs.org/) first.

### One command

On Windows, double-click \`start.bat\`. It starts the existing API and frontend in separate terminal windows.

### Manual setup

From the repository root:

\`\`\`bash
npm install
npm run dev
\`\`\`

Open the frontend at **http://localhost:3001**.

- Frontend: http://localhost:3001
- Existing API: http://localhost:3000
- Health check: http://localhost:3000/api/health
- Supported services: http://localhost:3000/api/supported
- Stats: http://localhost:3000/api/stats

The API and frontend use separate ports so they do not compete for port 3000.

## Configuration

For local development, the frontend defaults to \`http://localhost:3000\`. For a separately deployed frontend and API, set \`NEXT_PUBLIC_API_URL\` to the public origin of your API **before building the frontend**.

Create \`frontend/.env.local\` using \`frontend/.env.example\` as a template:

\`\`\`env
NEXT_PUBLIC_SITE_NAME=Evo Bypass
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

For the deployed API, set \`CORS_ORIGIN\` to the exact frontend origin, for example \`https://your-site.vercel.app\`. Do not place private API keys in \`NEXT_PUBLIC_*\` variables.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | \`/api/health\` | Health check |
| GET | \`/api/stats\` | Current in-memory stats |
| GET | \`/api/supported\` | Service directory |
| POST | \`/api/bypass\` | Resolve one URL |
| POST | \`/api/bypass/bulk\` | Bulk endpoint requiring the configured API key |

Example request:

\`\`\`bash
curl -X POST http://localhost:3000/api/bypass \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/link"}'
\`\`\`

## Deploy

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md). For the simplest production setup, deploy the existing Node API as a web service and the Next.js frontend to a supported Next.js host. Set the API URL and CORS origin to match those public URLs.

## Browser helper

For browser-side automation, use the [official izen.lol userscript installation guide](https://izen.lol/blog/izen-userscript). EVO links to the official guide; it does not copy or host that userscript.

## License

See [LICENSE](LICENSE).
