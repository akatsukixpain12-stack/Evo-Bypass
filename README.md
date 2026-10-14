# EVO Bypass

EVO Bypass is a minimal, monochrome link-resolver interface and API built with Next.js. Its homepage supports one link or batches of up to 100 unique URLs, processed with limited concurrency and individual results.

## Deploy on Vercel

1. Import this repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Keep the framework preset as **Next.js** and use the standard Next.js build settings.
4. Deploy. The UI and `/api/*) handlers deploy together as one Vercel project; no second Express server is required.
5. If using the bulk API endpoint, configure `API_KEY` as a server-side Environment Variable.

## Local development

From `frontend/`:

```bash
npm install
npm run dev
```

## API checks

- `/api/health`
- `/api/supported`
- `/api/stats`
- `/api/test`
- `POST /api/bypass`

The homepage batch limit of 100 is an application limit only. Individual providers can still impose their own restrictions, and no resolver can promise every link will work. Runtime counters are in-memory and may reset across Vercel serverless invocations.

## Browser userscript

- [Izen official userscript guide](https://izen.lol/blog/izen-userscript)
- [Tampermonkey official website](https://www.tampermonkey.net/)

Install a userscript manager in a compatible browser before installing a script. EVO links to these official resources; it does not bundle third-party APKs or execute browser userscripts inside its server API.

## Links

- [Buy Me a Coffee](https://buymeacoffee.com/Officialknightly)

## License

See [LICENSE](LICENSE).
