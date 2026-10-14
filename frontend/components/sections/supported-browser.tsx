"use client";

import { CheckCircle2, Globe, MonitorSmartphone, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";

type Service = { name: string; domain: string; category: string; status: "provider-api" | "browser-userscript" | "unsupported" | string };

export function SupportedBrowser() {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/supported", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success || !Array.isArray(data.services)) {
          throw new Error("The service list could not be loaded from this deployment.");
        }
        setServices(data.services);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "The service list is unavailable.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return services.filter((service) =>
      !normalized || `${service.name} ${service.domain} ${service.category} ${service.status}`.toLowerCase().includes(normalized)
    );
  }, [query, services]);

  const categories = [...new Set(filteredServices.map((service) => service.category))];
  const providerCount = services.filter((service) => service.status === "provider-api").length;
  const browserCount = services.filter((service) => service.status === "browser-userscript").length;

  return (
    <div className="mx-auto w-[min(1180px,calc(100%-24px))] py-16 md:py-20">
      <GlassCard className="rounded-[32px] p-5 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--text-muted)]">EVO resolver</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-5xl">
          Service coverage
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--text-muted)] md:text-base">
          This list separates domains routed through the provider API from key systems that may need a userscript in your browser. A listed service can still fail if its provider changes or rate-limits requests.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-[color:var(--text-muted)]">
          <span className="rounded-full border border-[color:var(--border-color)] bg-[color:var(--card-solid)] px-4 py-2">Categories: {categories.length}</span>
          <span className="rounded-full border border-[color:var(--border-color)] bg-[color:var(--card-solid)] px-4 py-2">Provider API domains: {providerCount}</span>
          <span className="rounded-full border border-[color:var(--border-color)] bg-[color:var(--card-solid)] px-4 py-2">Browser-only domains: {browserCount}</span>
        </div>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-14 w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--card-solid)] pl-12 pr-5 text-sm outline-none"
            placeholder="Search service, domain, or category..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <p className="mt-4 text-sm text-[color:var(--text-muted)]">
          {loading ? "Loading service coverage…" : `Showing ${filteredServices.length} domains.`}
        </p>
        {loadError && <p className="mt-3 text-sm text-rose-400" role="alert">{loadError}</p>}

        {!loading && !loadError && filteredServices.length === 0 && (
          <p className="mt-8 rounded-2xl border border-[color:var(--border-color)] p-5 text-sm text-[color:var(--text-muted)]">No matching service domains found.</p>
        )}

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {filteredServices.map((service) => {
            const providerBacked = service.status === "provider-api";
            const StatusIcon = providerBacked ? CheckCircle2 : MonitorSmartphone;
            return (
              <div key={`${service.name}-${service.domain}`} className="flex items-center gap-4 rounded-[20px] border border-[color:var(--border-color)] bg-[color:var(--card-solid)] p-4">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${providerBacked ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-[color:var(--text-primary)]">{service.name}</h2>
                  <p className="truncate text-sm text-[color:var(--text-muted)]">{service.domain}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">{providerBacked ? "Provider API" : "Browser userscript may be required"}</p>
                </div>
                <span className="ml-auto rounded-full border border-[color:var(--border-color)] px-3 py-1 text-xs text-[color:var(--text-muted)]">{service.category}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <a className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] px-4 py-2" href="https://izen.lol/blog/izen-userscript" target="_blank" rel="noopener noreferrer"><MonitorSmartphone className="h-4 w-4"/> Izen userscript guide</a>
          <a className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] px-4 py-2" href="https://github.com/bypass-vip/userscript" target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4"/> Userscript source</a>
        </div>
      </GlassCard>
    </div>
  );
}
