# EVO Bypass

EVO Bypass is a responsive link-resolver interface and API built with Next.js. The Vercel deployment uses **one project and same-origin API routes**—no separately deployed Express server is required.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. In **Project Settings → Build and Deployment**, set **Root Directory** to `frontend`.
3. Leave the framework preset as **Next.js**.
4. Deploy. Vercel should install from `frontend/package.json` and run the Next.js build automatically.
5. If using the bulk endpoint, add `API_KEY` as a server-side Environment Variable in Vercel. Do not prefix it with `NEXT_PUBLIC_`.

After deployment, test:
- `https://your-project.vercel.app/`
- `https://your-project.vercel.app/api/health`
- `https://your-project.vercel.app/api/supported`

## Local development

From the `frontend` directory:

```bash
npm install
npm run dev
```

Open `http://localhost:3001`. The API routes are served by the same Next.js app.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Runtime stats (best-effort in serverless environments) |
| GET | `/api/supported` | Supported service directory |
| GET | `/api/test` | API smoke test |
| POST | `/api/bypass` | Resolve one URL |
| POST | `/api/bypass/bulk` | Bulk requests (requires server-side `API_KEY`) |

## Notes

- Vercel runs API handlers as serverless functions. In-memory counters are temporary and can reset between invocations; they are not a durable analytics database.
- Provider link flows change frequently, so no resolver can guarantee every provider URL will always work.
- The project also retains its Express server for traditional local/server hosting, but **do not configure that custom server as the Vercel entry point**.

## Browser helper

Use the [official izen.lol userscript guide](https://izen.lol/blog/izen-userscript). EVO links to the official guide rather than copying or hosting that userscript.

## License

See [LICENSE](LICENSE).
