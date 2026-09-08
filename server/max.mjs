import https from "node:https";
import { formatLeadText } from "./lead-text.mjs";

const MAX_HOST = "platform-api2.max.ru";
const MAX_TIMEOUT_MS = 15000;

function maxCredentials() {
  const token = typeof process.env.MAX_BOT_TOKEN === "string" ? process.env.MAX_BOT_TOKEN.trim() : "";
  const rawChatId = typeof process.env.MAX_CHAT_ID === "string" ? process.env.MAX_CHAT_ID.trim() : "";
  const chatId = /^-?\d+$/.test(rawChatId) ? Number(rawChatId) : rawChatId;
  return { token, chatId };
}

export function maxConfigured() {
  const { token, chatId } = maxCredentials();
  return Boolean(token && chatId !== "" && chatId != null);
}

function networkErrorCode(error) {
  if (!error || typeof error !== "object") return undefined;
  if (typeof error.code === "string") return error.code;
  if (error.cause && typeof error.cause === "object" && typeof error.cause.code === "string") {
    return error.cause.code;
  }
  return undefined;
}

function isTimeoutError(error) {
  const code = networkErrorCode(error);
  return code === "ETIMEDOUT" || code === "ESOCKETTIMEDOUT" || code === "ETIMEOUT";
}

function payloadDescription(payload) {
  if (!payload || typeof payload !== "object") return undefined;
  if (typeof payload.message === "string") return payload.message.slice(0, 200);
  if (typeof payload.error === "string") return payload.error.slice(0, 200);
  if (payload.error && typeof payload.error === "object" && typeof payload.error.message === "string") {
    return payload.error.message.slice(0, 200);
  }
  return undefined;
}

function postMaxMessage(token, chatId, text) {
  const payload = JSON.stringify({
    text,
    notify: true,
  });
  const query = new URLSearchParams({
    chat_id: String(chatId),
    disable_link_preview: "true",
  });

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: MAX_HOST,
        path: `/messages?${query.toString()}`,
        method: "POST",
        family: 4,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = null;
          }
          resolve({ status: response.statusCode || 0, payload: json });
        });
      },
    );
    request.setTimeout(MAX_TIMEOUT_MS, () => {
      request.destroy(Object.assign(new Error("MAX API timeout"), { code: "ETIMEDOUT" }));
    });
    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

export async function sendMax(lead) {
  const { token, chatId } = maxCredentials();
  if (!token || chatId === "" || chatId == null) {
    return { ok: false, status: 500, reason: "not_configured" };
  }

  try {
    const response = await postMaxMessage(token, chatId, formatLeadText(lead));
    const payload = response.payload;

    if (response.status >= 200 && response.status < 300) {
      return { ok: true, status: 200 };
    }

    return {
      ok: false,
      status: 502,
      reason: "max_rejected",
      maxStatus: response.status,
      description: payloadDescription(payload),
    };
  } catch (error) {
    const errorCode = networkErrorCode(error);
    if (isTimeoutError(error)) {
      return {
        ok: false,
        status: 502,
        reason: "max_timeout",
        errorCode: errorCode || "ETIMEDOUT",
        hint: "MAX API timed out (ETIMEDOUT).",
      };
    }
    return { ok: false, status: 502, reason: "max_network", errorCode };
  }
}
