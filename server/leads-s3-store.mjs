/**
 * Durable lead + delivery-queue store on Timeweb S3 (ru-1).
 * Idempotent create via If-None-Match: * (409/412 => already exists).
 * Secrets only from env; never log credentials.
 */
import { createHash, createHmac } from "node:crypto";
import https from "node:https";

const EMPTY_SHA256 = createHash("sha256").update("").digest("hex");

export function s3Configured(env = process.env) {
  return Boolean(
    env.S3_BUCKET?.trim() &&
      env.S3_ACCESS_KEY?.trim() &&
      env.S3_SECRET_KEY?.trim() &&
      (env.S3_ENDPOINT?.trim() || true),
  );
}

function cfg(env = process.env) {
  return {
    endpoint: (env.S3_ENDPOINT || "https://s3.twcstorage.ru").replace(/\/$/, ""),
    region: (env.S3_REGION || "ru-1").trim(),
    bucket: env.S3_BUCKET.trim(),
    accessKey: env.S3_ACCESS_KEY.trim(),
    secretKey: env.S3_SECRET_KEY.trim(),
  };
}

function hmac(key, data) {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
}

function amzDate(d = new Date()) {
  const iso = d.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amz: iso, date: iso.slice(0, 8) };
}

async function s3Request({ method, key, body, extraHeaders, env }) {
  const c = cfg(env);
  const url = new URL(c.endpoint);
  const host = url.host;
  const canonicalUri = `/${c.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const payload = body == null ? Buffer.alloc(0) : Buffer.isBuffer(body) ? body : Buffer.from(body, "utf8");
  const payloadHash = sha256Hex(payload);
  const { amz, date } = amzDate();
  const headers = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amz,
    ...(extraHeaders || {}),
  };
  if (payload.length) headers["content-length"] = String(payload.length);
  if (payload.length) headers["content-type"] = headers["content-type"] || "application/json";

  const signedHeaderNames = Object.keys(headers)
    .map((h) => h.toLowerCase())
    .sort();
  const canonicalHeaders = signedHeaderNames.map((n) => `${n}:${headers[n].toString().trim()}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${date}/${c.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amz,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const kDate = hmac(`AWS4${c.secretKey}`, date);
  const kRegion = hmac(kDate, c.region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${c.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: host,
        method,
        path: canonicalUri,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    req.on("error", (error) => {
      resolve({ status: 0, errorCode: error.code || "s3_network", body: "" });
    });
    req.setTimeout(20000, () => {
      req.destroy();
      resolve({ status: 0, errorCode: "ETIMEDOUT", body: "" });
    });
    if (payload.length) req.write(payload);
    req.end();
  });
}

export function leadObjectKey(id) {
  return `leads/${id}.json`;
}

export function queueObjectKey(kind, id) {
  return `queue/${kind}/${id}.json`;
}

/** Create-only put. Returns { ok, created, existed, etag }. */
export async function putLeadIdempotent(lead, env = process.env) {
  const key = leadObjectKey(lead.id);
  const body = JSON.stringify({ ...lead, storedAt: new Date().toISOString() });
  const res = await s3Request({
    method: "PUT",
    key,
    body,
    extraHeaders: { "if-none-match": "*" },
    env,
  });
  if (res.status === 200 || res.status === 204) {
    return { ok: true, created: true, existed: false, etag: res.headers?.etag || null, key };
  }
  // Concurrent create or already present
  if (res.status === 412 || res.status === 409 || res.status === 400) {
    const head = await s3Request({ method: "HEAD", key, body: null, env });
    if (head.status === 200) {
      return { ok: true, created: false, existed: true, etag: head.headers?.etag || null, key };
    }
  }
  // Fallback if provider ignores If-None-Match: compare existing body hash
  if (res.status === 200 || res.status >= 400) {
    const existing = await getJson(key, env);
    if (existing.ok && existing.json?.id === lead.id) {
      return { ok: true, created: false, existed: true, etag: existing.etag, key };
    }
  }
  return {
    ok: false,
    reason: "s3_put_failed",
    status: res.status,
    errorCode: res.errorCode || null,
  };
}

export async function getJson(key, env = process.env) {
  const res = await s3Request({ method: "GET", key, body: null, env });
  if (res.status !== 200) {
    return { ok: false, status: res.status, errorCode: res.errorCode || null };
  }
  try {
    return { ok: true, json: JSON.parse(res.body), etag: res.headers?.etag || null };
  } catch {
    return { ok: false, reason: "s3_json_invalid", status: res.status };
  }
}

export async function putQueueItem(kind, id, payload, env = process.env) {
  const key = queueObjectKey(kind, id);
  const body = JSON.stringify({ ...payload, id, queuedAt: new Date().toISOString() });
  // Idempotent queue slot per lead id
  const res = await s3Request({
    method: "PUT",
    key,
    body,
    extraHeaders: { "if-none-match": "*" },
    env,
  });
  if (res.status === 200 || res.status === 204) return { ok: true, created: true, key };
  if (res.status === 412 || res.status === 409) return { ok: true, created: false, key };
  // overwrite allowed for retry metadata refresh
  const overwrite = await s3Request({ method: "PUT", key, body, env });
  return {
    ok: overwrite.status === 200 || overwrite.status === 204,
    created: false,
    key,
    status: overwrite.status,
  };
}

export async function deleteObject(key, env = process.env) {
  const res = await s3Request({ method: "DELETE", key, body: null, env });
  return { ok: res.status === 204 || res.status === 200 || res.status === 404, status: res.status };
}

export async function listKeys(prefix, env = process.env) {
  const c = cfg(env);
  const url = new URL(c.endpoint);
  const host = url.host;
  const query = `list-type=2&prefix=${encodeURIComponent(prefix)}&max-keys=100`;
  const canonicalUri = `/${c.bucket}`;
  const payloadHash = EMPTY_SHA256;
  const { amz, date } = amzDate();
  const headers = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amz,
  };
  const signedHeaderNames = ["host", "x-amz-content-sha256", "x-amz-date"];
  const canonicalHeaders = signedHeaderNames.map((n) => `${n}:${headers[n]}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");
  // Query must be sorted for AWS sig; list-type, max-keys, prefix
  const canonicalQuery = [
    "list-type=2",
    "max-keys=100",
    `prefix=${encodeURIComponent(prefix)}`,
  ].join("&");
  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${date}/${c.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amz, credentialScope, sha256Hex(canonicalRequest)].join(
    "\n",
  );
  const kDate = hmac(`AWS4${c.secretKey}`, date);
  const kRegion = hmac(kDate, c.region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${c.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return new Promise((resolve) => {
    const req = https.request(
      { hostname: host, method: "GET", path: `${canonicalUri}?${query}`, headers },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const xml = Buffer.concat(chunks).toString("utf8");
          const keys = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]);
          resolve({ ok: res.statusCode === 200, status: res.statusCode || 0, keys });
        });
      },
    );
    req.on("error", (error) => resolve({ ok: false, errorCode: error.code || "s3_network", keys: [] }));
    req.setTimeout(20000, () => {
      req.destroy();
      resolve({ ok: false, errorCode: "ETIMEDOUT", keys: [] });
    });
    req.end();
  });
}

export async function putSheetDedupeMarker(leadId, env = process.env) {
  // Prevent concurrent duplicate Sheet appends for the same lead id.
  return putQueueItem("sheet-done", leadId, { leadId, mirrored: true }, env);
}

export async function sheetAlreadyMirrored(leadId, env = process.env) {
  const head = await s3Request({
    method: "HEAD",
    key: queueObjectKey("sheet-done", leadId),
    body: null,
    env,
  });
  return head.status === 200;
}
