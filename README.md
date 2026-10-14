# EVO Bypass

EVO Bypass is a responsive link-resolver UI and JSON API served by **one Node.js process on one port**.

## Features

- Gemini-inspired responsive interface with springy motion
- Link validation, loading/error feedback, and copy/open result actions
- Searchable supported-service directory
- API health and live statistics
- Existing Express API and Next.js UI served from the same origin

Provider link flows can change, so not every provider URL is guaranteed to resolve.

## Run locally

Install [Node.js](https://nodejs.org/) first. From the repository root:

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. The UI and API share this one server:

- App: `http://localhost:3000`
- Health: `http://localhost:3000/api/health`
- Supported services: `http://localhost:3000/api/supported`
- Stats: `http://localhost:3000/api/stats`

On Windows, double-click `start.bat`.

## Deploy

Deploy the **repository root** as one Node.js web service.

- Install: `npm install`
- Build: `npm run build`
- Start: `npm start`

Set `NODE_ENV=production` and let the host provide `PORT`. The UI and API share the same origin, so a separate frontend URL or second API service is not required.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/stats` | In-memory statistics |
| GET | `/api/supported` | Supported service directory |
| POST | `/api/bypass` | Resolve one URL |
| POST | `/api/bypass/bulk` | Bulk endpoint requiring the configured API key |

## Browser helper

Use the [official izen.lol userscript guide](https://izen.lol/blog/izen-userscript). EVO links to the guide rather than copying or hosting the userscript.

## License

See [LICENSE](LICENSE).
