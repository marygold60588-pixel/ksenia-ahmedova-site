import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import dns from "node:dns";
import { lookup } from "node:dns/promises";
import fs from "node:fs/promises";
import path from "node:path";
import { createReadStream } from "node:fs";

dns.setDefaultResultOrder("ipv4first");
const BUILD_ID = "telegram-proxy";
const TELEGRAM_HOST = "api.telegram.org";
const TELEGRAM_PORT = 443;
const TELEGRAM_TIMEOUT_MS = 15000;

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

function telegramProxyRaw() {
  return typeof process.env.TELEGRAM_PROXY === "string" ? process.env.TELEGRAM_PROXY.trim() : "";
}

function getTelegramProxy() {
  const raw = telegramProxyRaw();
  if (!raw) return null;

  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "invalid_proxy_url" };
  }

  const protocol = url.protocol.replace(":", "").toLowerCase();
  const supported = new Set(["http", "https", "socks", "socks4", "socks4a", "socks5", "socks5h"]);
  if (!supported.has(protocol) || !url.hostname) {
    return { ok: false, error: "unsupported_proxy_protocol" };
  }

  return { ok: true, url, protocol };
}

function telegramProxyMeta() {
  const proxy = getTelegramProxy();
  if (!proxy) return { configured: false, protocol: null };
  if (!proxy.ok) return { configured: true, protocol: "invalid" };
  return { configured: true, protocol: proxy.protocol };
}

function timeoutError(message = "Telegram API timeout") {
  return Object.assign(new Error(message), { code: "ETIMEDOUT" });
}

function proxyError(message) {
  return Object.assign(new Error(message), { code: "EPROXY" });
}

function networkErrorCode(error) {
  if (!error || typeof error !== "object") return undefined;
  if (typeof error.code === "string") return error.code;
  if (error.cause && typeof error.cause === "object" && typeof error.cause.code === "string") {
    return error.cause.code;
  }
  return undefined;
}

function isTelegramTimeoutError(error) {
  const code = networkErrorCode(error);
  return code === "ETIMEDOUT" || code === "ESOCKETTIMEDOUT" || code === "ETIMEOUT";
}

function telegramTimeoutHint(proxyConfigured) {
  if (proxyConfigured) {
    return "Telegram API timed out through TELEGRAM_PROXY. Check that the proxy can reach api.telegram.org:443.";
  }
  return "Telegram API timed out (ETIMEDOUT). The hoster may block api.telegram.org:443. Set TELEGRAM_PROXY.";
}

function readExact(socket, size) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let received = 0;

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
    };

    const onData = (chunk) => {
      chunks.push(chunk);
      received += chunk.length;
      if (received < size) return;
      cleanup();
      const buf = Buffer.concat(chunks);
      if (buf.length > size) socket.unshift(buf.subarray(size));
      resolve(buf.subarray(0, size));
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const onClose = () => {
      cleanup();
      reject(proxyError("proxy connection closed"));
    };

    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("close", onClose);
  });
}

function connectTcp(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port, family: 4 });
    socket.setTimeout(timeoutMs, () => {
      socket.destroy(timeoutError());
    });
    socket.once("connect", () => {
      socket.removeListener("error", reject);
      resolve(socket);
    });
    socket.once("error", reject);
  });
}

function connectHttpProxy(proxyUrl, targetHost, targetPort, timeoutMs) {
  return new Promise((resolve, reject) => {
    const isTlsProxy = proxyUrl.protocol === "https:";
    const port = Number(proxyUrl.port) || (isTlsProxy ? 443 : 80);
    const headers = {
      Host: `${targetHost}:${targetPort}`,
    };
    if (proxyUrl.username || proxyUrl.password) {
      const auth = `${decodeURIComponent(proxyUrl.username)}:${decodeURIComponent(proxyUrl.password)}`;
      headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
    }

    const request = (isTlsProxy ? https : http).request({
      hostname: proxyUrl.hostname,
      port,
      method: "CONNECT",
      path: `${targetHost}:${targetPort}`,
      family: 4,
      headers,
    });
    request.setTimeout(timeoutMs, () => {
      request.destroy(timeoutError());
    });
    request.once("connect", (response, socket, head) => {
      if (response.statusCode !== 200) {
        socket.destroy();
        reject(proxyError(`proxy CONNECT ${response.statusCode}`));
        return;
      }
      if (head && head.length) socket.unshift(head);
      socket.setTimeout(timeoutMs, () => {
        socket.destroy(timeoutError());
      });
      resolve(socket);
    });
    request.once("error", reject);
    request.end();
  });
}

async function connectSocks5(proxyUrl, targetHost, targetPort, timeoutMs) {
  const socket = await connectTcp(proxyUrl.hostname, Number(proxyUrl.port) || 1080, timeoutMs);
  try {
    const user = decodeURIComponent(proxyUrl.username);
    const pass = decodeURIComponent(proxyUrl.password);
    const offerAuth = user.length > 0 || pass.length > 0;

    const greetingPromise = readExact(socket, 2);
    socket.write(offerAuth ? Buffer.from([0x05, 0x02, 0x00, 0x02]) : Buffer.from([0x05, 0x01, 0x00]));
    const greeting = await greetingPromise;
    if (greeting[0] !== 0x05) {
      throw proxyError("SOCKS5 greeting failed");
    }
    if (greeting[1] === 0xff) {
      throw proxyError("SOCKS5 no acceptable auth");
    }
    if (greeting[1] === 0x02) {
      const userBuf = Buffer.from(user);
      const passBuf = Buffer.from(pass);
      if (userBuf.length > 255 || passBuf.length > 255) {
        throw proxyError("SOCKS5 credentials too long");
      }
      const authPromise = readExact(socket, 2);
      socket.write(Buffer.concat([Buffer.from([0x01, userBuf.length]), userBuf, Buffer.from([passBuf.length]), passBuf]));
      const auth = await authPromise;
      if (auth[1] !== 0x00) {
        throw proxyError("SOCKS5 auth failed");
      }
    } else if (greeting[1] !== 0x00) {
      throw proxyError("SOCKS5 unsupported auth");
    }

    const hostBuf = Buffer.from(targetHost);
    if (hostBuf.length > 255) {
      throw proxyError("SOCKS5 host too long");
    }
    const request = Buffer.alloc(7 + hostBuf.length);
    request[0] = 0x05;
    request[1] = 0x01;
    request[2] = 0x00;
    request[3] = 0x03;
    request[4] = hostBuf.length;
    hostBuf.copy(request, 5);
    request.writeUInt16BE(targetPort, 5 + hostBuf.length);
    const headPromise = readExact(socket, 4);
    socket.write(request);

    const head = await headPromise;
    if (head[1] !== 0x00) {
      throw proxyError(`SOCKS5 CONNECT failed (${head[1]})`);
    }
    if (head[3] === 0x01) await readExact(socket, 6);
    else if (head[3] === 0x04) await readExact(socket, 18);
    else if (head[3] === 0x03) {
      const len = await readExact(socket, 1);
      await readExact(socket, len[0] + 2);
    } else {
      throw proxyError("SOCKS5 unknown ATYP");
    }

    return socket;
  } catch (error) {
    socket.destroy();
    throw error;
  }
}

async function connectSocks4a(proxyUrl, targetHost, targetPort, timeoutMs) {
  const socket = await connectTcp(proxyUrl.hostname, Number(proxyUrl.port) || 1080, timeoutMs);
  try {
    const userBuf = Buffer.from(decodeURIComponent(proxyUrl.username));
    const hostBuf = Buffer.from(targetHost);
    const request = Buffer.alloc(9 + userBuf.length + hostBuf.length);
    request[0] = 0x04;
    request[1] = 0x01;
    request.writeUInt16BE(targetPort, 2);
    request[4] = 0x00;
    request[5] = 0x00;
    request[6] = 0x00;
    request[7] = 0x01;
    userBuf.copy(request, 8);
    request[8 + userBuf.length] = 0x00;
    hostBuf.copy(request, 9 + userBuf.length);
    request[request.length - 1] = 0x00;
    const responsePromise = readExact(socket, 8);
    socket.write(request);

    const response = await responsePromise;
    if (response[1] !== 90) {
      throw proxyError(`SOCKS4 CONNECT failed (${response[1]})`);
    }
    return socket;
  } catch (error) {
    socket.destroy();
    throw error;
  }
}

function openProxyTunnel(proxyUrl, targetHost, targetPort, timeoutMs) {
  const protocol = proxyUrl.protocol.replace(":", "").toLowerCase();
  if (protocol === "http" || protocol === "https") {
    return connectHttpProxy(proxyUrl, targetHost, targetPort, timeoutMs);
  }
  if (protocol === "socks" || protocol === "socks5" || protocol === "socks5h") {
    return connectSocks5(proxyUrl, targetHost, targetPort, timeoutMs);
  }
  if (protocol === "socks4" || protocol === "socks4a") {
    return connectSocks4a(proxyUrl, targetHost, targetPort, timeoutMs);
  }
  return Promise.reject(proxyError("unsupported_proxy_protocol"));
}

async function connectTelegramTls(proxyUrl) {
  const tunnel = await openProxyTunnel(proxyUrl, TELEGRAM_HOST, TELEGRAM_PORT, TELEGRAM_TIMEOUT_MS);
  return new Promise((resolve, reject) => {
    let settled = false;
    const tlsSocket = tls.connect(
      {
        socket: tunnel,
        servername: TELEGRAM_HOST,
      },
      () => {
        if (settled) return;
        settled = true;
        tlsSocket.setTimeout(0);
        resolve(tlsSocket);
      },
    );
    tlsSocket.setTimeout(TELEGRAM_TIMEOUT_MS, () => {
      tlsSocket.destroy(timeoutError());
    });
    tlsSocket.once("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
  });
}

function telegramHttpsOptions(extra) {
  const proxy = getTelegramProxy();
  if (proxy && !proxy.ok) {
    throw proxyError(proxy.error);
  }

  const options = {
    hostname: TELEGRAM_HOST,
    family: 4,
    ...extra,
  };

  if (proxy) {
    options.agent = false;
    options.createConnection = (_opts, callback) => {
      connectTelegramTls(proxy.url)
        .then((socket) => callback(null, socket))
        .catch(callback);
    };
  }

  return options;
}

function postTelegramMessage(token, body) {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    let requestOptions;
    try {
      requestOptions = telegramHttpsOptions({
        path: `/bot${token}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      });
    } catch (error) {
      reject(error);
      return;
    }

    const request = https.request(requestOptions, (response) => {
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
    });
    request.setTimeout(TELEGRAM_TIMEOUT_MS, () => {
      request.destroy(timeoutError());
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
    const errorCode = networkErrorCode(error);
    const proxyConfigured = Boolean(telegramProxyRaw());

    if (errorCode === "EPROXY") {
      return {
        ok: false,
        status: 500,
        reason: "proxy_invalid",
        errorCode,
        hint: "TELEGRAM_PROXY is set but invalid. Use http://, https://, socks5://, or socks4://.",
      };
    }

    if (isTelegramTimeoutError(error)) {
      return {
        ok: false,
        status: 502,
        reason: "telegram_timeout",
        errorCode: errorCode || "ETIMEDOUT",
        hint: telegramTimeoutHint(proxyConfigured),
      };
    }

    return { ok: false, status: 502, reason: "telegram_network", errorCode };
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
  const proxyMeta = telegramProxyMeta();
  if (telegram.ok) {
    console.info("[leads] telegram success", { httpStatus: 200, proxyConfigured: proxyMeta.configured });
  } else if (telegram.reason === "not_configured") {
    console.error("[leads] telegram error", { reason: "not_configured" });
  } else if (telegram.reason === "proxy_invalid") {
    console.error("[leads] telegram error", {
      reason: "proxy_invalid",
      errorCode: telegram.errorCode,
      hint: telegram.hint,
    });
  } else if (telegram.reason === "telegram_timeout") {
    console.error("[leads] telegram timeout", {
      reason: "telegram_timeout",
      errorCode: telegram.errorCode,
      proxyConfigured: proxyMeta.configured,
      proxyProtocol: proxyMeta.protocol,
      hint: telegram.hint,
    });
  } else if (telegram.reason === "telegram_network") {
    console.error("[leads] telegram error", {
      reason: "telegram_network",
      errorCode: telegram.errorCode,
      proxyConfigured: proxyMeta.configured,
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
  if (telegram.reason === "proxy_invalid") {
    sendJson(req, res, 500, {
      ok: false,
      stage: "telegram_proxy_invalid",
      hint: telegram.hint || null,
    });
    return;
  }
  if (telegram.reason === "telegram_timeout") {
    sendJson(req, res, 502, {
      ok: false,
      stage: "telegram_timeout",
      errorCode: telegram.errorCode || "ETIMEDOUT",
      hint: telegram.hint || null,
    });
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

  const result = { ok: true, build: BUILD_ID, proxy: telegramProxyMeta() };
  const dnsStarted = Date.now();
  try {
    const dns4 = await lookup(TELEGRAM_HOST, { family: 4 });
    result.dns = { address: dns4.address, family: dns4.family, ms: Date.now() - dnsStarted };
  } catch (error) {
    result.dns = { errorCode: networkErrorCode(error) || "dns_failed", ms: Date.now() - dnsStarted };
    sendJson(req, res, 200, result);
    return;
  }

  const httpsStarted = Date.now();
  result.https = await new Promise((resolve) => {
    let requestOptions;
    try {
      requestOptions = telegramHttpsOptions({
        path: "/",
        method: "GET",
      });
    } catch (error) {
      resolve({
        errorCode: networkErrorCode(error) || "proxy_invalid",
        ms: Date.now() - httpsStarted,
      });
      return;
    }

    const request = https.request(requestOptions, (response) => {
      response.resume();
      resolve({ status: response.statusCode || 0, ms: Date.now() - httpsStarted });
    });
    request.setTimeout(8000, () => {
      request.destroy(timeoutError());
    });
    request.on("error", (error) => {
      const errorCode = networkErrorCode(error) || "https_failed";
      resolve({
        errorCode,
        timeout: isTelegramTimeoutError(error),
        ms: Date.now() - httpsStarted,
      });
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
  const proxy = telegramProxyMeta();
  console.log(`Server listening on ${HOST}:${PORT}`);
  if (proxy.configured) {
    console.info("[telegram] proxy enabled", { protocol: proxy.protocol });
  } else {
    console.info("[telegram] proxy disabled");
  }
});
