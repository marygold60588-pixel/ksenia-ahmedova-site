import net from "node:net";
import tls from "node:tls";
import { channelLabel, formatLeadText } from "./lead-text.mjs";

const SMTP_TIMEOUT_MS = 20000;
const SITE_URL = "https://ksenia-ahmedova.ru/";

function env(name) {
  return typeof process.env[name] === "string" ? process.env[name].trim() : "";
}

function emailSettings() {
  const host = env("EMAIL_HOST");
  const port = Number(env("EMAIL_PORT") || "587") || 587;
  const user = env("EMAIL_USER");
  const password = env("EMAIL_PASSWORD");
  const to = env("EMAIL_TO");
  return { host, port, user, password, to, from: user };
}

export function emailConfigured() {
  const { host, user, password, to } = emailSettings();
  return Boolean(host && user && password && to);
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function encodeSubject(text) {
  return `=?UTF-8?B?${Buffer.from(String(text), "utf8").toString("base64")}?=`;
}

function encodeAddress(address) {
  return String(address).replace(/[\r\n<>]/g, "");
}

function buildMime({ from, to, subject, text }) {
  const body = Buffer.from(text, "utf8").toString("base64").replace(/(.{76})/g, "$1\r\n");
  return [
    `From: ${encodeAddress(from)}`,
    `To: ${encodeAddress(to)}`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    body,
    "",
  ].join("\r\n");
}

function readReply(socket) {
  return new Promise((resolve, reject) => {
    let buf = "";
    const onData = (chunk) => {
      buf += chunk.toString("utf8");
      if (!buf.endsWith("\r\n")) return;
      const lines = buf.split("\r\n").filter(Boolean);
      const last = lines.at(-1);
      if (last && /^\d{3} /.test(last)) {
        cleanup();
        resolve({ code: Number(last.slice(0, 3)), text: buf });
      }
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onClose = () => {
      cleanup();
      reject(Object.assign(new Error("SMTP connection closed"), { code: "ESMTP" }));
    };
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
    };
    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("close", onClose);
  });
}

async function sendCmd(socket, command, expected) {
  if (command != null) socket.write(`${command}\r\n`);
  const reply = await readReply(socket);
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(reply.code)) {
    throw Object.assign(new Error(`SMTP ${reply.code}`), { code: "ESMTP", smtpCode: reply.code });
  }
  return reply;
}

function connectSmtp(host, port, implicitTls) {
  return new Promise((resolve, reject) => {
    const socket = implicitTls
      ? tls.connect({ host, port, servername: host, family: 4 })
      : net.connect({ host, port, family: 4 });
    socket.setTimeout(SMTP_TIMEOUT_MS, () => {
      socket.destroy(Object.assign(new Error("SMTP timeout"), { code: "ETIMEDOUT" }));
    });
    const readyEvent = implicitTls ? "secureConnect" : "connect";
    socket.once(readyEvent, () => {
      socket.removeListener("error", reject);
      resolve(socket);
    });
    socket.once("error", reject);
  });
}

function upgradeTls(socket, host) {
  return new Promise((resolve, reject) => {
    const tlsSocket = tls.connect({ socket, servername: host }, () => resolve(tlsSocket));
    tlsSocket.setTimeout(SMTP_TIMEOUT_MS, () => {
      tlsSocket.destroy(Object.assign(new Error("SMTP timeout"), { code: "ETIMEDOUT" }));
    });
    tlsSocket.once("error", reject);
  });
}

async function sendSmtpMail({ to, subject, text }) {
  const settings = emailSettings();
  if (!settings.host || !settings.user || !settings.password) {
    return { ok: false, status: 500, reason: "not_configured" };
  }

  const implicitTls = settings.port === 465;
  let socket = await connectSmtp(settings.host, settings.port, implicitTls);
  try {
    await sendCmd(socket, null, 220);
    await sendCmd(socket, `EHLO ${settings.host}`, 250);
    if (!implicitTls) {
      await sendCmd(socket, "STARTTLS", 220);
      socket = await upgradeTls(socket, settings.host);
      await sendCmd(socket, `EHLO ${settings.host}`, 250);
    }
    await sendCmd(socket, "AUTH LOGIN", 334);
    await sendCmd(socket, Buffer.from(settings.user, "utf8").toString("base64"), 334);
    await sendCmd(socket, Buffer.from(settings.password, "utf8").toString("base64"), 235);
    await sendCmd(socket, `MAIL FROM:<${encodeAddress(settings.from)}>`, 250);
    await sendCmd(socket, `RCPT TO:<${encodeAddress(to)}>`, [250, 251]);
    await sendCmd(socket, "DATA", 354);
    socket.write(`${buildMime({ from: settings.from, to, subject, text })}\r\n.\r\n`);
    await sendCmd(socket, null, 250);
    await sendCmd(socket, "QUIT", [221, 250]);
    socket.end();
    return { ok: true, status: 200 };
  } catch (error) {
    socket.destroy();
    const errorCode = error && typeof error === "object" && typeof error.code === "string" ? error.code : undefined;
    if (errorCode === "ETIMEDOUT" || errorCode === "ESOCKETTIMEDOUT") {
      return { ok: false, status: 502, reason: "email_timeout", errorCode: errorCode || "ETIMEDOUT" };
    }
    return {
      ok: false,
      status: 502,
      reason: errorCode === "ESMTP" ? "email_rejected" : "email_network",
      errorCode,
      smtpCode: error && typeof error === "object" ? error.smtpCode : undefined,
    };
  }
}

export async function sendOwnerEmail(lead) {
  if (!emailConfigured()) {
    return { ok: false, status: 500, reason: "not_configured" };
  }
  const { to } = emailSettings();
  return sendSmtpMail({
    to,
    subject: `Заявка с сайта: ${lead.name} · ${channelLabel(lead.contactChannel)}`,
    text: formatLeadText(lead),
  });
}

export async function sendVisitorEmail(lead) {
  if (!emailConfigured()) {
    return { ok: false, status: 500, reason: "not_configured" };
  }
  if (!looksLikeEmail(lead.contact)) {
    return { ok: false, status: 400, reason: "invalid_visitor_email" };
  }

  const name = lead.name && lead.name !== "Гайд" ? lead.name : "";
  const greeting = name ? `Здравствуйте, ${name}.` : "Здравствуйте.";
  const text = [
    greeting,
    "",
    "Заявка принята. Я свяжусь с вами по почте.",
    "",
    SITE_URL,
  ].join("\n");

  return sendSmtpMail({
    to: lead.contact.trim(),
    subject: "Заявка принята",
    text,
  });
}

export { looksLikeEmail };
