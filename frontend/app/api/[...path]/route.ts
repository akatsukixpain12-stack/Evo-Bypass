import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BypassService = require("@/lib/server/bypass.cjs") as {
  bypass: (url: string) => Promise<{
    success: boolean;
    destination?: string;
    service?: string;
    processingTime?: number;
    error?: string;
  }>;
};

const catalog = require("@/lib/server/catalog.cjs") as {
  services: Array<{ name: string; domain: string; category: string; status: string }>;
};

type RuntimeStats = {
  totalBypassed: number;
  successCount: number;
  failureCount: number;
  serviceStats: Record<string, number>;
  uptime: number;
};

const stats: RuntimeStats = {
  totalBypassed: 0,
  successCount: 0,
  failureCount: 0,
  serviceStats: {},
  uptime: Date.now()
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function getPath(request: NextRequest) {
  return request.nextUrl.pathname.replace(/^\/api\/?/, "").replace(/\/+$/, "");
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const runWorker = async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length) }, () => runWorker()));
  return results;
}

function getStats() {
  return {
    total: stats.totalBypassed,
    success: stats.successCount,
    failure: stats.failureCount,
    successRate: stats.successCount > 0
      ? ((stats.successCount / (stats.successCount + stats.failureCount)) * 100).toFixed(2) + "%"
      : "0%",
    services: stats.serviceStats,
    uptime: Math.floor((Date.now() - stats.uptime) / 1000)
  };
}

async function handle(request: NextRequest) {
  const path = getPath(request);

  if (request.method === "GET" && path === "health") {
    return json({
      status: "operational",
      uptime: Math.floor((Date.now() - stats.uptime) / 1000),
      timestamp: new Date().toISOString(),
      version: "2.1.0",
      platform: "vercel"
    });
  }

  if (request.method === "GET" && path === "stats") {
    return json({ success: true, stats: getStats() });
  }

  if (request.method === "GET" && path === "supported") {
    const services = catalog.services;
    return json({
      success: true,
      services,
      total: services.length,
      categories: [...new Set(services.map((service) => service.category))]
    });
  }

  if (request.method === "GET" && path === "test") {
    return json({ success: true, message: "API is working!", timestamp: new Date().toISOString() });
  }

  if (request.method === "POST" && path === "bypass") {
    let body: { url?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "Request body must be valid JSON" }, 400);
    }

    if (typeof body.url !== "string" || !body.url.trim()) {
      return json({ success: false, error: "URL is required" }, 400);
    }

    let parsed: URL;
    try {
      parsed = new URL(body.url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Unsupported protocol");
    } catch {
      return json({ success: false, error: "A valid HTTP or HTTPS URL is required" }, 400);
    }

    const result = await BypassService.bypass(parsed.toString());
    if (result.success) {
      stats.totalBypassed++;
      stats.successCount++;
      const service = result.service || "Unknown";
      stats.serviceStats[service] = (stats.serviceStats[service] || 0) + 1;
    } else {
      stats.failureCount++;
    }
    return json(result);
  }

  if (request.method === "POST" && path === "bypass/bulk") {
    let body: { urls?: unknown; apiKey?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "Request body must be valid JSON" }, 400);
    }

    if (!process.env.API_KEY || typeof body.apiKey !== "string" || body.apiKey !== process.env.API_KEY) {
      return json({ success: false, error: "Invalid or missing API key" }, 401);
    }
    if (!Array.isArray(body.urls) || body.urls.length === 0) {
      return json({ success: false, error: "URLs array is required" }, 400);
    }
    if (body.urls.length > 100 || body.urls.some((url) => typeof url !== "string")) {
      return json({ success: false, error: "Provide at most 100 URL strings per request" }, 400);
    }

    // Keep provider traffic bounded even when a caller submits the full 100-link batch.
    // Results remain in input order while only three provider requests run at once.
    const urls = body.urls as string[];
    const results = await mapWithConcurrency(urls, 3, async (url) => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return { success: false, service: "Unknown", error: "A valid HTTP or HTTPS URL is required" };
        }
        return await BypassService.bypass(parsed.toString());
      } catch {
        return { success: false, service: "Unknown", error: "A valid HTTP or HTTPS URL is required" };
      }
    });
    for (const result of results) {
      if (result.success) {
        stats.totalBypassed++;
        stats.successCount++;
        const service = result.service || "Unknown";
        stats.serviceStats[service] = (stats.serviceStats[service] || 0) + 1;
      } else {
        stats.failureCount++;
      }
    }
    const successful = results.filter((result) => result.success).length;
    return json({
      success: true,
      results,
      total: results.length,
      successful,
      failed: results.length - successful,
      successRate: ((successful / results.length) * 100).toFixed(2) + "%"
    });
  }

  return json({ success: false, error: "Endpoint not found", path }, 404);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
