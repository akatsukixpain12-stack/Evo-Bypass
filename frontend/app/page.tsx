"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Clipboard,
  Command,
  Globe2,
  Link2,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";

type Service = {
  name: string;
  domain: string;
  category: string;
  status: string;
};

type BypassResult = {
  success: boolean;
  destination?: string;
  service?: string;
  processingTime?: number;
  error?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "" : "http://localhost:3000");
const fallbackServices: Service[] = [
  { name: "Linkvertise", domain: "linkvertise.com", category: "Ad-link", status: "active" },
  { name: "Lootlabs", domain: "lootlabs.gg", category: "Ad-link", status: "active" },
  { name: "Work.ink", domain: "work.ink", category: "Ad-link", status: "active" },
  { name: "Rekonise", domain: "rekonise.com", category: "Social unlock", status: "active" },
  { name: "PlatoBoost", domain: "platoboost.com", category: "Key system", status: "active" },
  { name: "Sub2Unlock", domain: "sub2unlock.com", category: "Social unlock", status: "active" }
];

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<BypassResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [total, setTotal] = useState(23387799);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/supported`).then((response) => response.json()),
      fetch(`${API_URL}/api/stats`).then((response) => response.json())
    ])
      .then(([supported, stats]) => {
        if (supported.success && supported.services?.length) setServices(supported.services);
        if (stats.success && stats.stats?.total) setTotal(stats.stats.total);
      })
      .catch(() => undefined);
  }, []);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return services.slice(0, 12);
    return services
      .filter((service) => `${service.name} ${service.domain} ${service.category}`.toLowerCase().includes(normalized))
      .slice(0, 12);
  }, [query, services]);

  async function handleBypass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);

    try {
      new URL(url);
    } catch {
      setError("Paste a complete link starting with https://");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bypass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = (await response.json()) as BypassResult;
      if (!response.ok || !data.success) {
        setError(data.error || "This link could not be resolved.");
        return;
      }
      setResult(data);
      setTotal((current) => current + 1);
    } catch {
      setError("The resolver is offline. Start the API server and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result?.destination) return;
    await navigator.clipboard.writeText(result.destination);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="overflow-hidden">
      <section className="relative mx-auto max-w-[1320px] px-5 pb-24 pt-14 sm:px-8 lg:pt-24">
        <div className="orb orb-cyan" />
        <div className="orb orb-purple" />
        <div className="relative grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="eyebrow mb-7 w-fit">
              <span className="status-dot" /> Resolver network online
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white sm:text-7xl lg:text-[6.8rem]">
              Links in.
              <span className="gradient-text block">Freedom out.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/55">
              EVO is a fast, privacy-first link resolver with coverage for
              <span className="text-cyan-300"> 100+ services</span>. No ads, no
              sign-ups, no maze.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm text-white/60">
              {["Live routing", "No link history", "API ready"].map((item) => (
                <span key={item} className="chip">
                  <Check className="h-3.5 w-3.5 text-emerald-300" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[34px] bg-cyan-400/10 blur-3xl" />
            <form onSubmit={handleBypass} className="glass-panel relative p-3 sm:p-4">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/35">
                <Command className="h-4 w-4 text-cyan-300" /> Quick resolve
                <span className="ml-auto rounded-md border border-white/10 px-2 py-1 text-[10px] tracking-normal text-white/35">EVO / 01</span>
              </div>
              <div className="p-2 sm:p-5">
                <label htmlFor="url" className="mb-3 block text-sm text-white/55">Paste a gated link</label>
                <div className="input-shell flex items-center gap-3">
                  <Link2 className="ml-1 h-5 w-5 shrink-0 text-cyan-300" />
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://linkvertise.com/..."
                    disabled={loading}
                    className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/25"
                  />
                  <button className="resolve-button" type="submit" disabled={loading || !url}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {loading ? "Resolving" : "Resolve"}
                  </button>
                </div>
                {error && <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
                {result?.destination && (
                  <div className="result-panel mt-4">
                    <div className="mb-3 flex items-center justify-between text-xs text-white/45">
                      <span className="flex items-center gap-2"><span className="status-dot" /> Resolved via {result.service}</span>
                      <span>{result.processingTime}ms</span>
                    </div>
                    <p className="break-all text-sm leading-6 text-white">{result.destination}</p>
                    <div className="mt-4 flex gap-2">
                      <button type="button" className="action-button" onClick={copyResult}>
                        {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <a className="action-button flex-1 justify-center bg-white text-black hover:bg-cyan-100" href={result.destination} target="_blank" rel="noreferrer">
                        Open destination <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
                <p className="mt-4 text-center text-xs text-white/30">Only use EVO with links you are authorized to access.</p>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-20 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Globe2, value: `${services.length}+`, label: "services mapped" },
            { icon: Zap, value: "< 2s", label: "average resolution" },
            { icon: ShieldCheck, value: total.toLocaleString(), label: "links resolved" }
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="metric-card">
              <Icon className="h-5 w-5 text-cyan-300" />
              <div><strong>{value}</strong><span>{label}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-4 w-fit">The network</p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Built for the long tail.</h2>
              <p className="mt-4 max-w-lg text-white/45">From key systems to ad-links and file hosts, find your service in one resolver.</p>
            </div>
            <Link href="/supported" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white">View full directory <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="mb-6 flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <Search className="h-4 w-4 text-white/35" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 100+ services..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => (
              <div key={`${service.name}-${service.domain}`} className="service-card">
                <div className="service-icon"><Globe2 className="h-4 w-4 text-cyan-300" /></div>
                <div className="min-w-0"><p className="truncate font-medium text-white">{service.name}</p><p className="truncate text-xs text-white/35">{service.domain}</p></div>
                <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-4 px-5 py-20 sm:px-8 md:grid-cols-3">
        {[
          { icon: Sparkles, title: "One clean pass", body: "Smart service detection picks the right resolver before the request leaves your browser." },
          { icon: ShieldCheck, title: "Private by default", body: "We do not build a link history. Requests are processed and forgotten." },
          { icon: Zap, title: "Made for speed", body: "A focused API and lightweight interface keep the path from paste to destination short." }
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="feature-card"><Icon className="h-5 w-5 text-cyan-300" /><h3>{title}</h3><p>{body}</p></div>
        ))}
      </section>
    </main>
  );
}
