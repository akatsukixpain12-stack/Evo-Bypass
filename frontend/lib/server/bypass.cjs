const axios = require("axios");
const net = require("node:net");
const { detectService: detectCatalogService } = require("./catalog.cjs");

const PROVIDER_API = "https://api.bypass.vip/bypass";

class BypassService {
  static TIMEOUT = 25000;

  /**
   * Resolves supported shortlinks through the provider's documented GET API.
   *
   * Important: this is a resolver, not a generic HTML scraper. Guessing the
   * first href or scraping arbitrary user-supplied pages produced false
   * positives and allowed the server to fetch attacker-controlled URLs.
   */
  static async bypass(input) {
    const startedAt = Date.now();
    const base = {
      success: false,
      service: "Unknown",
      processingTime: 0
    };

    try {
      const parsed = this.parsePublicHttpUrl(input);
      if (!parsed) {
        return {
          ...base,
          error: "Enter a public HTTP or HTTPS link."
        };
      }

      const detected = this.detectService(parsed.toString());
      const service = detected && detected.name !== "Direct resolver" &&
        detected.name !== "Other / unsupported"
        ? detected.name
        : "Other / shortlink";

      // These systems depend on browser sessions or page-side interaction.
      // Don't claim a server API can replace those steps.
      if (detected.status === "browser-userscript") {
        return {
          ...base,
          service,
          error: "This key system needs a compatible browser userscript or page session; the EVO server API cannot complete it directly.",
          processingTime: Date.now() - startedAt
        };
      }

      const response = await axios.get(PROVIDER_API, {
        // The published provider example uses GET ?url=..., not POST JSON.
        params: { url: parsed.toString() },
        timeout: this.TIMEOUT,
        headers: {
          Accept: "application/json",
          "User-Agent": "EVO-Bypass/2.2 (+https://github.com/official-knightly/Evo-Bypass)"
        },
        // Let us format provider errors consistently below.
        validateStatus: () => true
      });

      const data = response.data && typeof response.data === "object"
        ? response.data
        : {};

      // Provider's documented success schema is { status: "success", result: "https://..." }.
      const candidate = data.result || data.destination || data.url;
      if (response.status >= 200 && response.status < 300 && data.status !== "error" &&
          (data.status === "success" || candidate)) {
        const destination = this.parseDestination(candidate);
        if (destination && destination.href !== parsed.href) {
          return {
            success: true,
            destination: destination.href,
            service,
            provider: "bypass.vip",
            processingTime: Date.now() - startedAt
          };
        }
        if (destination && destination.href === parsed.href) {
          return {
            ...base,
            service,
            error: "The provider returned the original link; it was not bypassed.",
            processingTime: Date.now() - startedAt
          };
        }
        return {
          ...base,
          service,
          error: "The provider reported success but did not return a valid HTTP or HTTPS destination.",
          processingTime: Date.now() - startedAt
        };
      }

      const providerMessage = typeof data.message === "string" && data.message.trim()
        ? data.message.trim()
        : (response.status === 429
          ? "Provider rate limit reached. Wait a little and try again."
          : `Provider could not resolve this link (HTTP ${response.status}).`);

      return {
        ...base,
        service,
        error: this.limitError(providerMessage),
        provider: "bypass.vip",
        processingTime: Date.now() - startedAt
      };
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.code === "ECONNABORTED"
          ? "The resolver timed out. Try again later."
          : "The bypass provider is unavailable right now. Try again later.")
        : (error instanceof Error ? error.message : "Bypass failed.");

      return {
        ...base,
        error: this.limitError(message),
        processingTime: Date.now() - startedAt
      };
    }
  }

  static parsePublicHttpUrl(input) {
    if (typeof input !== "string" || !input.trim()) return null;
    let url;
    try {
      url = new URL(input.trim());
    } catch {
      return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;

    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") ||
        hostname.endsWith(".local") || hostname.endsWith(".internal")) {
      return null;
    }

    // Don't submit local/private IPs to a third-party resolver.
    const ipType = net.isIP(hostname);
    if (ipType === 4 && this.isPrivateIPv4(hostname)) return null;
    if (ipType === 6 && this.isNonPublicIPv6(hostname)) return null;

    return url;
  }

  static isPrivateIPv4(ip) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
    const [a, b] = parts;
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127);
  }

  static isNonPublicIPv6(ip) {
    const normalized = ip.toLowerCase();
    return normalized === "::" || normalized === "::1" ||
      normalized.startsWith("fc") || normalized.startsWith("fd") ||
      normalized.startsWith("fe8") || normalized.startsWith("fe9") ||
      normalized.startsWith("fea") || normalized.startsWith("feb") ||
      normalized.startsWith("::ffff:127.") || normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:192.168.") || normalized.startsWith("2001:db8:");
  }

  static parseDestination(candidate) {
    if (typeof candidate !== "string" || !candidate.trim()) return null;
    try {
      const url = new URL(candidate.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      if (url.username || url.password) return null;
      return url;
    } catch {
      return null;
    }
  }

  static detectService(url) {
    try {
      return detectCatalogService(url);
    } catch {
      return { name: "Direct resolver", domain: "*", category: "Fallback" };
    }
  }

  static limitError(message) {
    // Keep external error text useful without returning unbounded provider output.
    return String(message || "Unable to resolve this link.").replace(/[\r\n]+/g, " ").slice(0, 240);
  }
}

module.exports = BypassService;
