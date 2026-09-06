const BypassService = require("../../server/services/bypass");
const { services } = require("../../server/services/catalog");

let totalBypassed = 23387799;
let successCount = 0;
let failureCount = 0;
const startedAt = Date.now();

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(204, {});

  const path = event.path.replace(/^\/?\.netlify\/functions\/api/, "").replace(/^\/api/, "") || "/";

  if (event.httpMethod === "GET" && path === "/health") {
    return json(200, {
      status: "operational",
      uptime: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
      version: "netlify-1.0.0"
    });
  }

  if (event.httpMethod === "GET" && path === "/supported") {
    return json(200, {
      success: true,
      services,
      total: services.length,
      categories: [...new Set(services.map((service) => service.category))]
    });
  }

  if (event.httpMethod === "GET" && path === "/stats") {
    return json(200, {
      success: true,
      stats: {
        total: totalBypassed,
        success: successCount,
        failure: failureCount,
        successRate: successCount + failureCount > 0
          ? `${((successCount / (successCount + failureCount)) * 100).toFixed(2)}%`
          : "0%",
        uptime: Math.floor((Date.now() - startedAt) / 1000)
      }
    });
  }

  if (event.httpMethod === "POST" && path === "/bypass") {
    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { success: false, error: "Request body must be valid JSON" });
    }

    if (!payload.url) return json(400, { success: false, error: "URL is required" });
    const result = await BypassService.bypass(payload.url);
    if (result.success) {
      totalBypassed += 1;
      successCount += 1;
    } else {
      failureCount += 1;
    }
    return json(result.success ? 200 : 422, result);
  }

  return json(404, { success: false, error: "Endpoint not found" });
};
