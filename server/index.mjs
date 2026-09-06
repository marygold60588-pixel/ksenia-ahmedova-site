import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { createReadStream } from "node:fs";

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;
const DIST = path.resolve(process.cwd(), "dist");
const SITE_URL = "https://ksenia-ahmedova.ru/";
const BODY_LIMIT = 8192;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;

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

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
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
    return null;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

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

  if (!name || !contact || !intent || message === null) return null;

  return { name, contact, intent, message, source };
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

async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { status: 500 };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.ok && payload && payload.ok === true) {
      return { status: 200 };
    }
    return { status: 502 };
  } catch {
    return { status: 502 };
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
    sendJson(res, 405, { ok: false });
    return;
  }

  if (isRateLimited(clientIp(req))) {
    sendJson(res, 429, { ok: false });
    return;
  }

  let raw;
  try {
    raw = await readBody(req);
  } catch (error) {
    sendJson(res, error.status === 413 ? 413 : 400, { ok: false });
    return;
  }

  const lead = parseLead(raw);
  if (!lead) {
    sendJson(res, 400, { ok: false });
    return;
  }

  const telegram = await sendTelegramMessage(formatTelegramText(lead));
  sendJson(res, telegram.status === 200 ? 200 : telegram.status, { ok: telegram.status === 200 });
}

async function handleStatic(req, res, urlPath) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { ok: false });
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

    if (urlPath === "/api/health" || urlPath.startsWith("/api/health?")) {
      if (req.method !== "GET") {
        sendJson(res, 405, { ok: false });
        return;
      }
      sendJson(res, 200, { ok: true });
      return;
    }

    if (urlPath === "/api/leads" || urlPath.startsWith("/api/leads?")) {
      await handleLeads(req, res);
      return;
    }

    if (urlPath.startsWith("/api/")) {
      sendJson(res, 404, { ok: false });
      return;
    }

    await handleStatic(req, res, urlPath);
  } catch {
    if (!res.headersSent) {
      sendJson(res, 500, { ok: false });
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
