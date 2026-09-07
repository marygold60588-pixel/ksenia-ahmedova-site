import http from "node:http";
import https from "node:https";
import dns from "node:dns";
import { lookup } from "node:dns/promises";
import fs from "node:fs/promises";
import path from "node:path";
import { createReadStream } from "node:fs";

dns.setDefaultResultOrder("ipv4first");
const BUILD_ID = "e9d8cac-diag";

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;
const DIST = path.resolve(process.cwd(), "dist");
const SITE_URL = "https://ksenia-ahmedova.ru/";
const BODY_LIMIT = 8192;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const ALLOWED_ORIGINS = new Set([
  "https://ksenia-ahmedova.ru",
  "https://www.ksenia-ahmedova.ru",
]);

const INTENTS = {
  diagnosis: "Диагностика сценария",
  consultation: "Консультация",
  gift: "Гайд",
};

const SOURCES = new Set(["site-form", "paper-card", "agent"]);

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const rateHits = new Map();

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (typeof origin !== "string" || !ALLOWED_ORIGINS.has(origin)) {
    return {};
  }
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  };
}

function originDenied(req) {
  const origin = req.headers.origin;
  return typeof origin === "string" && origin.length > 0 && !ALLOWED_ORIGINS.has(origin);
}

function sendJson(req, res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...corsHeaders(req),
  });
  res.end(JSON.stringify(body));
}

function handleCorsPreflight(req, res) {
  const headers = corsHeaders(req);
  const allowed = Boolean(headers["Access-Control-Allow-Origin"]);
  res.writeHead(allowed ? 204 : 403, {
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end();
}

function firstHeaderIp(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  return value.split(",")[0].trim();
}

function clientIp(req) {
  return (
    firstHeaderIp(req.headers["x-forwarded-for"]) ||
    firstHeaderIp(req.headers["x-real-ip"]) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function isLocalOrUnknownIp(ip) {
  const value = String(ip).replace(/^::ffff:/, "");
  return (
    value === "unknown" ||
    value === "127.0.0.1" ||
    value === "::1" ||
    value.startsWith("10.") ||
    value.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value)
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (rateHits.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateHits.set(ip, recent);
  return false;
}

function sanitize(value, max) {
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, max);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        reject(Object.assign(new Error("payload too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseLead(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { lead: null, reason: "invalid_json" };
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { lead: null, reason: "invalid_shape" };
  }

  const name = typeof data.name === "string" ? sanitize(data.name, 80) : "";
  const contact = typeof data.contact === "string" ? sanitize(data.contact, 120) : "";
  const intentKey = typeof data.intent === "string" ? data.intent.trim() : "";
  const intent = Object.hasOwn(INTENTS, intentKey) ? intentKey : "";
  const message =
    data.message == null || data.message === ""
      ? ""
      : typeof data.message === "string"
        ? sanitize(data.message, 2000)
        : null;
  const source = typeof data.source === "string" && SOURCES.has(data.source) ? data.source : "";

  if (!name) return { lead: null, reason: "name" };
  if (!contact) return { lead: null, reason: "contact" };
  if (!intent) return { lead: null, reason: "intent" };
  if (message === null) return { lead: null, reason: "message" };
  if (!source) return { lead: null, reason: "source" };

  return { lead: { name, contact, intent, message, source }, reason: null };
}

function formatTelegramText(lead) {
  const when = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  return [
    "Новая заявка с сайта",
    "",
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    `Запрос: ${INTENTS[lead.intent]}`,
    `Сообщение: ${lead.message || "не указано"}`,
    "",
    `Страница: ${SITE_URL}`,
    `Дата/время: ${when}`,
  ].join("\n");
}

function telegramCredentials() {
  const token = typeof process.env.TELEGRAM_BOT_TOKEN === "string" ? process.env.TELEGRAM_BOT_TOKEN.trim() : "";
  const rawChatId = typeof process.env.TELEGRAM_CHAT_ID === "string" ? process.env.TELEGRAM_CHAT_ID.trim() : "";
  const chatId = /^-?\d+$/.test(rawChatId) ? Number(rawChatId) : rawChatId;
  return { token, chatId };
}

function networkErrorCode(error) {
  if (!error || typeof error !== "object") return undefined;
  if (typeof error.code === "string") return error.code;
  if (error.cause && typeof error.cause === "object" && typeof error.cause.code === "string") {
    return error.cause.code;
  }
  return undefined;
}

function postTelegramMessage(token, body) {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${token}/sendMessage`,
        method: "POST",
        family: 4,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            json = null;
          }
          resolve({ status: response.statusCode || 0, payload: json });
        });
      },
    );
    request.setTimeout(15000, () => {
      request.destroy(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" }));
    });
    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

async function sendTelegramMessage(text) {
  const { token, chatId } = telegramCredentials();
  if (!token || chatId === "" || chatId == null) {
    return { ok: false, status: 500, reason: "not_configured" };
  }

  try {
    const response = await postTelegramMessage(token, {
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    });
    const payload = response.payload;

    if (response.status >= 200 && response.status < 300 && payload && payload.ok === true) {
      return { ok: true, status: 200 };
    }

    return {
      ok: false,
      status: 502,
      reason: "telegram_rejected",
      telegramStatus: response.status,
      errorCode: payload && typeof payload.error_code === "number" ? payload.error_code : undefined,
      description:
        payload && typeof payload.description === "string" ? payload.description.slice(0, 200) : undefined,
    };
  } catch (error) {
    return { ok: false, status: 502, reason: "telegram_network", errorCode: networkErrorCode(error) };
  }
}

function safeFilePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }

  const relative = decoded.replace(/^\/+/, "");
  const full = path.resolve(DIST, relative);
  if (full !== DIST && !full.startsWith(`${DIST}${path.sep}`)) return null;
  return full;
}

async function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = CONTENT_TYPES[ext] || "application/octet-stream";
  const stat = await fs.stat(filePath);
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat.size,
  });
  createReadStream(filePath).pipe(res);
}

async function handleLeads(req, res) {
  if (req.method !== "POST") {
    sendJson(req, res, 405, { ok: false });
    return;
  }

  console.info("[leads] request received");

  if (originDenied(req)) {
    console.warn("[leads] rejected origin");
    sendJson(req, res, 403, { ok: false, stage: "origin" });
    return;
  }

  const ip = clientIp(req);
  if (!isLocalOrUnknownIp(ip) && isRateLimited(ip)) {
    console.warn("[leads] rate limited");
    sendJson(req, res, 429, { ok: false, stage: "rate_limited" });
    return;
  }

  let raw;
  try {
    raw = await readBody(req);
  } catch (error) {
    console.warn("[leads] validation failed", { reason: error.status === 413 ? "too_large" : "body" });
    sendJson(req, res, error.status === 413 ? 413 : 400, { ok: false, stage: "validation" });
    return;
  }

  const parsed = parseLead(raw);
  if (!parsed.lead) {
    console.warn("[leads] validation failed", { reason: parsed.reason });
    sendJson(req, res, 400, { ok: false, stage: "validation" });
    return;
  }

  const lead = parsed.lead;
  console.info("[leads] validation ok", { source: lead.source, intent: lead.intent });
  console.info("[leads] telegram attempt");

  const telegram = await sendTelegramMessage(formatTelegramText(lead));
  if (telegram.ok) {
    console.info("[leads] telegram success", { httpStatus: 200 });
  } else if (telegram.reason === "not_configured") {
    console.error("[leads] telegram error", { reason: "not_configured" });
  } else if (telegram.reason === "telegram_network") {
    console.error("[leads] telegram error", {
      reason: "telegram_network",
      errorCode: telegram.errorCode,
    });
  } else {
    console.error("[leads] telegram error", {
      reason: "telegram_rejected",
      httpStatus: telegram.telegramStatus,
      errorCode: telegram.errorCode,
      description: telegram.description,
    });
  }

  if (telegram.ok) {
    sendJson(req, res, 200, { ok: true });
    return;
  }
  if (telegram.reason === "not_configured") {
    sendJson(req, res, 500, { ok: false, stage: "telegram_not_configured" });
    return;
  }
  if (telegram.reason === "telegram_network") {
    sendJson(req, res, 502, {
      ok: false,
      stage: "telegram_network",
      errorCode: telegram.errorCode || null,
    });
    return;
  }
  sendJson(req, res, 502, {
    ok: false,
    stage: "telegram_rejected",
    telegramStatus: telegram.telegramStatus || null,
    description: telegram.description || null,
  });
}

async function handleOutbound(req, res) {
  if (req.method !== "GET") {
    sendJson(req, res, 405, { ok: false });
    return;
  }

  const result = { ok: true, build: BUILD_ID };
  const dnsStarted = Date.now();
  try {
    const dns4 = await lookup("api.telegram.org", { family: 4 });
    result.dns = { address: dns4.address, family: dns4.family, ms: Date.now() - dnsStarted };
  } catch (error) {
    result.dns = { errorCode: networkErrorCode(error) || "dns_failed", ms: Date.now() - dnsStarted };
    sendJson(req, res, 200, result);
    return;
  }

  const httpsStarted = Date.now();
  result.https = await new Promise((resolve) => {
    const request = https.request(
      {
        hostname: "api.telegram.org",
        path: "/",
        method: "GET",
        family: 4,
      },
      (response) => {
        response.resume();
        resolve({ status: response.statusCode || 0, ms: Date.now() - httpsStarted });
      },
    );
    request.setTimeout(8000, () => {
      request.destroy(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" }));
    });
    request.on("error", (error) => {
      resolve({ errorCode: networkErrorCode(error) || "https_failed", ms: Date.now() - httpsStarted });
    });
    request.end();
  });

  sendJson(req, res, 200, result);
}

async function handleStatic(req, res, urlPath) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(req, res, 405, { ok: false });
    return;
  }

  const filePath = safeFilePath(urlPath);
  if (!filePath) {
    res.writeHead(400);
    res.end();
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      await sendFile(res, filePath);
      return;
    }
  } catch {
    // Fall through to SPA index for unknown paths.
  }

  try {
    await sendFile(res, path.join(DIST, "index.html"));
  } catch {
    res.writeHead(404);
    res.end();
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = req.url || "/";

    if (urlPath.startsWith("/api/") && req.method === "OPTIONS") {
      handleCorsPreflight(req, res);
      return;
    }

    if (urlPath === "/api/health" || urlPath.startsWith("/api/health?")) {
      if (req.method !== "GET") {
        sendJson(req, res, 405, { ok: false });
        return;
      }
      sendJson(req, res, 200, { ok: true });
      return;
    }

    if (urlPath === "/api/outbound" || urlPath.startsWith("/api/outbound?")) {
      await handleOutbound(req, res);
      return;
    }

    if (urlPath === "/api/leads" || urlPath.startsWith("/api/leads?")) {
      await handleLeads(req, res);
      return;
    }

    if (urlPath.startsWith("/api/")) {
      sendJson(req, res, 404, { ok: false });
      return;
    }

    await handleStatic(req, res, urlPath);
  } catch {
    if (!res.headersSent) {
      sendJson(req, res, 500, { ok: false });
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
