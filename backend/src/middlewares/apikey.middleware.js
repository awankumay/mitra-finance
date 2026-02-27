const { env } = require("../config/env");

/**
 * API Key + Origin enforcement middleware.
 *
 * Two-gate check on every /api request (except /api/health):
 *
 * Gate 1 — X-API-Key header
 *   The key is embedded in the Vite frontend bundle and therefore technically
 *   readable by anyone who inspects the network tab or decompiles the bundle.
 *   Its purpose is to filter tools that do not know the application protocol
 *   (random scanners, generic endpoint crawlers, etc.).
 *
 * Gate 2 — Origin / Referer validation (production only)
 *   Browsers ALWAYS send the Origin header on cross-origin XHR/fetch and
 *   cannot be overridden by page JavaScript.  Postman and curl do NOT send
 *   Origin unless the user explicitly adds it.  In production, the backend
 *   rejects any request whose Origin (or Referer) is not in the CORS_ORIGIN
 *   allowlist — stopping automated tools that present the correct key but do
 *   not mimic a real browser session.
 *
 *   ⚠  A determined attacker who manually adds the correct Origin header in
 *   Postman CAN still pass Gate 2.  The authoritative data protection is the
 *   JWT auth layer (Gate 3 onwards), which requires a valid user account.
 *
 * In development mode Gate 2 is relaxed so local tools (Postman, test scripts)
 * still work without friction.
 */

// Pre-compute trusted origins once at startup from CORS_ORIGIN env variable.
const TRUSTED_ORIGINS = new Set(
  env.CORS_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, "")),
);

function apiKeyMiddleware(req, res, next) {
  // ── Health check bypass — no key required for uptime monitors ──────────
  if (req.path === "/health") {
    return next();
  }

  // ── CORS preflight bypass — browser sends OPTIONS before the real request;
  //    it does not include X-API-Key.  cors() middleware handles the response.
  if (req.method === "OPTIONS") {
    return next();
  }

  // ── Gate 1: API Key ─────────────────────────────────────────────────────
  const provided = req.headers["x-api-key"];

  if (!provided) {
    return res.status(401).json({ message: "Missing API key" });
  }

  if (!timingSafeEqual(provided, env.API_KEY)) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  // ── Gate 2: Origin / Referer (enforced only in production) ─────────────
  if (env.NODE_ENV === "production") {
    const origin = req.headers["origin"];
    const referer = req.headers["referer"];

    const originTrusted =
      origin && TRUSTED_ORIGINS.has(origin.replace(/\/$/, ""));

    const refererTrusted =
      !originTrusted &&
      referer &&
      [...TRUSTED_ORIGINS].some((o) => referer.startsWith(o));

    if (!originTrusted && !refererTrusted) {
      // Log the violation for audit purposes without leaking detail to caller
      console.warn(
        `[apikey] Blocked request — untrusted origin: "${origin || "(none)"}" | referer: "${referer || "(none)"}" | ip: ${req.ip}`,
      );
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  return next();
}

/**
 * Constant-time string comparison — prevents timing-based inference of the key.
 * Uses Node's built-in crypto.timingSafeEqual via Buffer when possible,
 * falls back to a manual XOR loop for non-equal lengths.
 */
function timingSafeEqual(a, b) {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) {
      // Still do a comparison on 'a' vs 'a' so timing is constant
      require("crypto").timingSafeEqual(bufA, bufA);
      return false;
    }
    return require("crypto").timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

module.exports = { apiKeyMiddleware };
