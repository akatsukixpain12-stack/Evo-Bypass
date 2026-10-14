"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  Clipboard,
  Globe2,
  Link2,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

type Service = {
  name: string;
  domain?: string;
  category?: string;
  status?: string;
};

type BypassResult = {
  success: boolean;
  destination?: string;
  service?: string;
  processingTime?: number;
  error?: string;
};

type ApiState = "checking" | "online" | "offline";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "")
).replace(/\/+$/, "");

function apiPath(path: string) {
  return API_BASE + path;
}

const fallbackServices: Service[] = [
  { name: "Linkvertise", domain: "linkvertise.com", category: "Ad-link" },
  { name: "Lootlabs", domain: "lootlabs.gg", category: "Ad-link" },
  { name: "Work.ink", domain: "work.ink", category: "Ad-link" },
  { name: "Rekonise", domain: "rekonise.com", category: "Social unlock" },
  { name: "Platoboost", domain: "platoboost.com", category: "Key system" },
  { name: "Sub2Unlock", domain: "sub2unlock.com", category: "Social unlock" }
];

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<BypassResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [total, setTotal] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [apiState, setApiState] = useState<ApiState>("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function loadApiInfo() {
      try {
        const [supportedResponse, statsResponse, healthResponse] = await Promise.all([
          fetch(apiPath("/api/supported"), { signal: controller.signal }),
          fetch(apiPath("/api/stats"), { signal: controller.signal }),
          fetch(apiPath("/api/health"), { signal: controller.signal })
        ]);

        if (!supportedResponse.ok || !statsResponse.ok) {
          throw new Error("The resolver API did not respond successfully.");
        }

        const [supported, stats] = await Promise.all([
          supportedResponse.json(),
          statsResponse.json()
        ]);
        const health = healthResponse.ok ? await healthResponse.json() : null;

        if (controller.signal.aborted) return;

        if (supported.success && Array.isArray(supported.services) && supported.services.length) {
          setServices(supported.services);
        }
        if (stats.success && typeof stats.stats?.total === "number") {
          setTotal(stats.stats.total);
        }
        setApiState(health?.status === "operational" ? "online" : "offline");
      } catch {
        if (!controller.signal.aborted) setApiState("offline");
      }
    }

    void loadApiInfo();
    return () => controller.abort();
  }, []);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return services.slice(0, 12);
    return services
      .filter((service) =>
        [service.name, service.domain || "", service.category || ""]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 12);
  }, [query, services]);

  async function handleBypass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        setError("Please use a link that starts with http:// or https://.");
        return;
      }
    } catch {
      setError("Paste a complete link starting with https://.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiPath("/api/bypass"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parsedUrl.toString() })
      });

      const data = (await response.json().catch(() => null)) as BypassResult | null;
      if (!response.ok || !data?.success || !data.destination) {
        setError(data?.error || "This link could not be resolved. Check the link and try again.");
        return;
      }

      setResult(data);
      setTotal((current) => (typeof current === "number" ? current + 1 : current));
    } catch {
      setApiState("offline");
      setError(
        "Could not reach the resolver API. Start the existing server on port 3000 or set NEXT_PUBLIC_API_URL to your deployed API address."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result?.destination) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.destination);
      } else {
        const field = document.createElement("textarea");
        field.value = result.destination;
        field.setAttribute("readonly", "true");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copiedSuccessfully = document.execCommand("copy");
        field.remove();
        if (!copiedSuccessfully) throw new Error("Clipboard unavailable");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Copy was blocked by the browser. Select the result URL and copy it manually.");
    }
  }

  return (
    <PageShell>
      <div className="evo-home relative isolate overflow-hidden">
        <div className="evo-backdrop" aria-hidden="true">
          <div className="evo-orb evo-orb-lilac floaty" />
          <div className="evo-orb evo-orb-blue floaty floaty-delay" />
          <div className="evo-orb evo-orb-pink floaty" />
        </div>

        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-7 sm:pb-20 sm:pt-16 lg:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="api-pill mx-auto w-fit" data-state={apiState}>
              <span className="api-dot" />
              <span>
                {apiState === "checking"
                  ? "Connecting to EVO"
                  : apiState === "online"
                    ? "Resolver connected"
                    : "Resolver needs a connection"}
              </span>
              <Activity className="ml-1 h-3.5 w-3.5 opacity-60" />
            </div>

            <div className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-[24px] border border-white/10 bg-white/[0.07] shadow-[0_12px_48px_rgba(135,117,255,0.18)] floaty">
              <div className="brand-spark">
                <Sparkles className="h-7 w-7" />
              </div>
            </div>

            <h1 className="hero-title mt-7 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Let your link
              <span className="block gradient-text">take the short way.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              Paste a supported link and let EVO try to resolve the destination.
              Clean interface, quick feedback, and no extra setup in this page.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <span className="soft-chip"><Check className="h-3.5 w-3.5" /> One-link workflow</span>
              <span className="soft-chip"><Zap className="h-3.5 w-3.5" /> Animated, responsive UI</span>
              <span className="soft-chip"><ShieldCheck className="h-3.5 w-3.5" /> URL validation</span>
            </div>
          </div>

          <div className="relative mx-auto mt-10 max-w-3xl sm:mt-12">
            <div className="composer-glow" aria-hidden="true" />
            <form onSubmit={handleBypass} className="composer-card relative">
              <div className="flex items-center gap-3 border-b border-white/[0.09] px-5 py-4 sm:px-7">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.07] text-violet-200">
                  <Link2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-white">Quick resolve</p>
                  <p className="mt-0.5 text-xs text-white/40">Paste a link to get started</p>
                </div>
                <span className="ml-auto hidden rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 sm:inline-flex">
                  EVO / LINK
                </span>
              </div>

              <div className="p-4 sm:p-7">
                <label htmlFor="source-url" className="mb-3 block text-left text-sm text-white/65">
                  Your link
                </label>
                <div className="url-composer flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
                  <Link2 className="ml-2 hidden h-5 w-5 shrink-0 text-violet-200/80 sm:block" />
                  <input
                    id="source-url"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://paste-your-link-here.com/…"
                    disabled={loading}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-white/30 sm:px-1"
                  />
                  <button className="resolve-button" type="submit" disabled={loading || !url.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {loading ? "Resolving…" : "Resolve link"}
                    {!loading && <ArrowUpRight className="h-4 w-4" />}
                  </button>
                </div>

                {error && (
                  <div role="alert" className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/[0.08] px-4 py-3 text-left text-sm leading-6 text-rose-100">
                    {error}
                  </div>
                )}

                {result?.destination && (
                  <div className="result-panel mt-4 text-left">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/45">
                      <span className="inline-flex items-center gap-2">
                        <span className="api-dot" data-state="online" />
                        Resolved by {result.service || "EVO"}
                      </span>
                      <span>{typeof result.processingTime === "number" ? result.processingTime + " ms" : "Complete"}</span>
                    </div>
                    <p className="break-all text-sm leading-6 text-white">{result.destination}</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button type="button" className="action-button" onClick={copyResult}>
                        {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy URL"}
                      </button>
                      <a
                        className="action-button action-button-primary flex-1 justify-center"
                        href={result.destination}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open destination <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-white/35">
                  Only submit links you are authorized to access. Some providers may change how their links work.
                </p>
              </div>
            </form>
          </div>

          <div className="mx-auto mt-5 flex max-w-3xl flex-col items-center justify-center gap-2 text-center sm:flex-row">
            <span className="text-xs text-white/35">Want browser-side help?</span>
            <a
              className="helper-link"
              href="https://izen.lol/blog/izen-userscript"
              target="_blank"
              rel="noopener noreferrer"
            >
              Official izen.lol userscript guide <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            <div className="metric-card spring-hover">
              <div className="metric-icon"><Globe2 className="h-5 w-5" /></div>
              <div className="min-w-0">
                <strong>{services.length}{services.length === 6 ? "+" : ""}</strong>
                <span>services in the directory</span>
              </div>
            </div>
            <div className="metric-card spring-hover">
              <div className="metric-icon"><Activity className="h-5 w-5" /></div>
              <div className="min-w-0">
                <strong className="metric-small">{apiState === "online" ? "Connected" : apiState === "checking" ? "Checking…" : "Offline"}</strong>
                <span>live API status</span>
              </div>
            </div>
            <div className="metric-card spring-hover">
              <div className="metric-icon"><Zap className="h-5 w-5" /></div>
              <div className="min-w-0">
                <strong>{typeof total === "number" ? total.toLocaleString() : "—"}</strong>
                <span>total links resolved (API)</span>
              </div>
            </div>
          </div>

          {apiState === "offline" && (
            <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-6 text-white/40">
              The page is ready, but its API is not connected. For local development, run the existing server on port 3000. For deployment, set <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/65">NEXT_PUBLIC_API_URL</code> to your API origin.
            </p>
          )}
        </section>

        <section className="border-y border-white/[0.08] bg-white/[0.018] px-4 py-16 sm:px-7 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="eyebrow mb-4 w-fit">Service directory</p>
                <h2 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Find your link service.</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/45">
                  Search the services supplied by the existing API. The list updates when the resolver responds.
                </p>
              </div>
              <Link href="/supported" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-white">
                View full directory <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="directory-search mt-7 flex max-w-lg items-center gap-3 px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search supported services"
                placeholder="Search name, domain, or category…"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-xs text-white/45 hover:text-white">
                  Clear
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServices.map((service) => (
                <div key={service.name + "-" + (service.domain || "")} className="directory-card spring-hover">
                  <div className="directory-icon"><Globe2 className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{service.name}</p>
                    <p className="mt-1 truncate text-xs text-white/40">{service.domain || service.category || "Supported service"}</p>
                  </div>
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-violet-300/80" />
                </div>
              ))}
              {filteredServices.length === 0 && (
                <div className="col-span-full rounded-2xl border border-white/10 px-5 py-8 text-center text-sm text-white/45">
                  No services match “{query}”. Try another name or domain.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-3 px-4 py-14 sm:grid-cols-3 sm:px-7 sm:py-16">
          {[
            {
              icon: Sparkles,
              title: "A calmer workflow",
              body: "One clear input, a visible loading state, and a result panel that is easy to use on mobile."
            },
            {
              icon: ShieldCheck,
              title: "Clear feedback",
              body: "URL validation and readable error messages help distinguish a bad link from an API connection problem."
            },
            {
              icon: Zap,
              title: "No extra server",
              body: "The interface uses the existing resolver API. It does not create another backend or proxy."
            }
          ].map(({ icon: Icon, title, body }) => (
            <article key={title} className="feature-card spring-hover">
              <div className="feature-icon"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/45">{body}</p>
            </article>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
