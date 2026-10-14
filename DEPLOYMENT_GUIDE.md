# EVO Bypass Deployment Guide

EVO Bypass serves the existing Express API and Next.js frontend in **one Node.js process on one port**. Do not deploy `server/` and `frontend/` as separate services.

## Deploy as one service

Set the repository root as the service root.

- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Start command:** `npm start`

Set `NODE_ENV=production` and let the host provide `PORT`. Use `/api/health` as the health check. The home page and API share one origin; a separate frontend URL and CORS server are not required. Keep `API_KEY` server-side if you use the bulk endpoint.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. On Windows, use `start.bat`.

## Troubleshooting

- **Blank page:** deploy the repository root as a Node.js service, not as a static HTML site. Check build and startup logs.
- **API offline:** open `/api/health` on the same domain.
- **Port conflict:** stop any old EVO process before restarting.
- **Provider error:** an operational API cannot guarantee every provider-specific link will continue to resolve.

## API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/stats` | In-memory stats |
| GET | `/api/supported` | Supported services |
| POST | `/api/bypass` | Resolve one URL |
| POST | `/api/bypass/bulk` | Bulk requests (API key required) |
