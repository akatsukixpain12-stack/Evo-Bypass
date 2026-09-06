"use client";

import { CheckCircle2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { supportedGroups } from "@/lib/data";

type Service = { name: string; domain: string; category: string; status: string };
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const fallbackServices: Service[] = supportedGroups.flatMap((group) =>
  group.items.map((item) => ({ name: item.name, domain: item.domains[0], category: group.name, status: "active" }))
);

export function SupportedBrowser() {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<Service[]>(fallbackServices);

  useEffect(() => {
    fetch(`${API_URL}/api/supported`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.services?.length) setServices(data.services);
      })
      .catch(() => undefined);
  }, []);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return services.filter((service) =>
      !normalized || `${service.name} ${service.domain} ${service.category}`.toLowerCase().includes(normalized)
    );
  }, [query, services]);

  const categories = [...new Set(filteredServices.map((service) => service.category))];

  return (
    <div className="mx-auto w-[min(1180px,calc(100%-24px))] py-16 md:py-20">
      <GlassCard className="rounded-[32px] p-5 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--text-muted)]">EVO resolver network</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-5xl">
          Supported services
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--text-muted)] md:text-base">
          Search the live service registry. Every hostname below is detected automatically when you submit a link.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-[color:var(--text-muted)]">
          <span className="rounded-full border border-[color:var(--border-color)] bg-[color:var(--card-solid)] px-4 py-2">Categories: {categories.length}</span>
          <span className="rounded-full border border-[color:var(--border-color)] bg-[color:var(--card-solid)] px-4 py-2">Services: {services.length}+</span>
          <span className="rounded-full border border-[color:var(--border-color)] bg-[color:var(--card-solid)] px-4 py-2">Status: operational</span>
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
        <p className="mt-4 text-sm text-[color:var(--text-muted)]">Showing {filteredServices.length} services.</p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {filteredServices.map((service) => (
            <div key={`${service.name}-${service.domain}`} className="flex items-center gap-4 rounded-[20px] border border-[color:var(--border-color)] bg-[color:var(--card-solid)] p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-[color:var(--text-primary)]">{service.name}</h2>
                <p className="truncate text-sm text-[color:var(--text-muted)]">{service.domain}</p>
              </div>
              <span className="ml-auto rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">{service.category}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
