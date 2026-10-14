"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Clipboard, Coffee, ExternalLink, Link2, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

type ItemResult = { input: string; success: boolean; destination?: string; service?: string; error?: string; processingTime?: number };
const MAX_LINKS = 100;
const DONATE_URL = "https://buymeacoffee.com/Officialknightly";

export default function HomePage() {
  const [rawLinks, setRawLinks] = useState("");
  const [results, setResults] = useState<ItemResult[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const controller = new AbortController();
    const checkApi = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store", signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok || data?.status !== "operational") throw new Error("Resolver API unavailable");
        if (!controller.signal.aborted) setApiStatus("online");
      } catch {
        if (!controller.signal.aborted) setApiStatus("offline");
      }
    };
    void checkApi();
    return () => controller.abort();
  }, []);

  const links = rawLinks.split(/[\n\r\t ,]+/).map((s) => s.trim()).filter(Boolean);
  const uniqueLinks = [...new Set(links)];
  const validCount = uniqueLinks.filter((value) => {
    try { const u = new URL(value); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; }
  }).length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running || uniqueLinks.length === 0) return;
    if (uniqueLinks.length > MAX_LINKS) {
      setResults([{ input: "", success: false, error: "Please submit no more than 100 links at once." }]);
      return;
    }
    setRunning(true);
    setProgress(0);
    setResults([]);
    const output: ItemResult[] = new Array(uniqueLinks.length);
    let cursor = 0;
    let completed = 0;
    const worker = async () => {
      while (true) {
        const index = cursor++;
        if (index >= uniqueLinks.length) return;
        const input = uniqueLinks[index];
        try {
          const parsed = new URL(input);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Only HTTP and HTTPS links are supported.");
          const response = await fetch("/api/bypass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: parsed.toString() })
          });
          const data = await response.json().catch(() => null);
          output[index] = response.ok && data?.success && data?.destination
            ? { input, success: true, destination: data.destination, service: data.service, processingTime: data.processingTime }
            : { input, success: false, error: data?.error || "This link could not be resolved." };
        } catch (error) {
          output[index] = { input, success: false, error: error instanceof Error ? error.message : "Request failed." };
        }
        completed++;
        setProgress(completed);
        setResults(output.filter(Boolean));
      }
    };
    try {
      await Promise.all(Array.from({ length: Math.min(3, uniqueLinks.length) }, () => worker()));
    } finally {
      setResults(output.filter(Boolean));
      setRunning(false);
    }
  }

  async function copyAll() {
    const text = results.filter((r) => r.success && r.destination).map((r) => r.destination).join("\n");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const successCount = results.filter((item) => item.success).length;
  const failedCount = results.filter((item) => !item.success).length;

  return (
    <PageShell>
      <main className="evo-minimal min-h-[78vh] px-4 pb-16 pt-14 sm:pt-24">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="evo-logo"><Sparkles className="h-5 w-5" /></div>
            <span className="text-xl font-semibold tracking-tight">EVO Bypass</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Where should your link take you?</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 sm:text-base">Paste one link or a list of links. Resolve up to 100 in one batch, with clear results for each.</p>
            <div className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] bg-[color:var(--card-solid)] px-3 py-1.5 text-xs text-[color:var(--text-muted)]" role="status" aria-live="polite">
                <span className={"h-2 w-2 rounded-full " + (apiStatus === "online" ? "bg-emerald-500" : apiStatus === "offline" ? "bg-rose-500" : "bg-amber-500")} />
                {apiStatus === "online" ? "Resolver API online" : apiStatus === "offline" ? "Resolver API unavailable — check Vercel deployment" : "Connecting to resolver…"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="evo-input-card mx-auto mt-8 max-w-2xl p-3 sm:p-4">
            <label className="sr-only" htmlFor="links">Links to resolve</label>
            <textarea id="links" value={rawLinks} onChange={(event) => setRawLinks(event.target.value)} disabled={running} rows={4} placeholder="Paste your link(s) here… one per line" className="evo-textarea w-full resize-y px-3 py-3 text-base outline-none" />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
              <span className="text-xs">{uniqueLinks.length} / {MAX_LINKS} links · {validCount} valid</span>
              <button className="evo-primary-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold" type="submit" disabled={running || validCount === 0 || uniqueLinks.length > MAX_LINKS}>
                {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                {running ? `Resolving ${progress}/${uniqueLinks.length}` : "Resolve links"}
              </button>
            </div>
            {uniqueLinks.length > MAX_LINKS && <p className="px-2 pt-2 text-sm" role="alert">The maximum is 100 unique links per batch.</p>}
          </form>

          {results.length > 0 && (
            <section className="evo-results mx-auto mt-6 max-w-2xl p-4 sm:p-5" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Results</h2>
                  <p className="mt-1 text-xs">{successCount} resolved · {failedCount} failed · {progress} of {uniqueLinks.length} processed</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={copyAll} className="evo-secondary-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"><Clipboard className="h-3.5 w-3.5"/>{copied ? "Copied" : "Copy successes"}</button>
                  {!running && <button type="button" onClick={() => { setResults([]); setProgress(0); }} className="evo-secondary-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"><RotateCcw className="h-3.5 w-3.5"/>Clear</button>}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {results.map((item, index) => (
                  <article key={item.input + index} className="evo-result-row">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs">{item.success ? (item.service || "Resolved") : "Could not resolve"}</p>
                      <p className="mt-1 break-all text-sm font-medium">{item.success ? item.destination : (item.input || item.error)}</p>
                      {!item.success && item.input && <p className="mt-1 text-xs">{item.error}</p>}
                    </div>
                    {item.success && item.destination && <a href={item.destination} target="_blank" rel="noopener noreferrer" aria-label="Open destination" className="evo-secondary-button shrink-0 rounded-full p-2"><ExternalLink className="h-4 w-4"/></a>}
                    {item.success && <Check className="h-4 w-4 shrink-0"/>}
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <a className="evo-text-link inline-flex items-center gap-2" href="https://izen.lol/blog/izen-userscript" target="_blank" rel="noopener noreferrer">Izen userscript guide <ExternalLink className="h-3.5 w-3.5"/></a>
            <a className="evo-text-link inline-flex items-center gap-2" href="https://raw.githubusercontent.com/bypass-vip/userscript/main/bypass-vip.user.js" target="_blank" rel="noopener noreferrer">Install bypass.vip userscript <ExternalLink className="h-3.5 w-3.5"/></a>
            <a className="evo-text-link inline-flex items-center gap-2" href="https://github.com/bypass-vip/userscript" target="_blank" rel="noopener noreferrer">Userscript source <ExternalLink className="h-3.5 w-3.5"/></a>
            <a className="evo-text-link inline-flex items-center gap-2" href="https://www.tampermonkey.net/" target="_blank" rel="noopener noreferrer">Tampermonkey <ExternalLink className="h-3.5 w-3.5"/></a>
            <a className="evo-text-link inline-flex items-center gap-2" href={DONATE_URL} target="_blank" rel="noopener noreferrer"><Coffee className="h-4 w-4"/> Buy me a coffee</a>
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-5">EVO can only resolve links supported by its current providers. The 100-link batch is an app-side limit, not a guarantee that every provider will accept every request.</p>
        </div>
      </main>
    </PageShell>
  );
}
