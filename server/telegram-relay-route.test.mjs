/**
 * Local routing check for all four intents — no real Telegram / Worker calls.
 * Run: node server/telegram-relay-route.test.mjs
 */
import assert from "node:assert/strict";
import http from "node:http";
import {
  CONSULTATION_RELAY_URL_DEFAULT,
  SITE_LEADS_RELAY_URL_DEFAULT,
  resolveTelegramRelay,
  telegramRelayEnv,
} from "./telegram-relay-route.mjs";

const LEGACY_URL = "http://127.0.0.1:3921";
const CONSULT_URL = "http://127.0.0.1:3922";
const LEGACY_SECRET = "local-legacy-secret-not-production";
const CONSULT_SECRET = "local-consult-secret-not-production";

function startMock(port, hits) {
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      hits.push({
        method: req.method,
        url: req.url,
        auth: req.headers.authorization || "",
        body,
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function postRelay(url, secret, text) {
  const payload = JSON.stringify({ text });
  const target = new URL(url);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname || "/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({ status: res.statusCode, raw: Buffer.concat(chunks).toString("utf8") });
        });
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

const env = {
  TELEGRAM_RELAY_URL: LEGACY_URL,
  TELEGRAM_RELAY_SECRET: LEGACY_SECRET,
  CONSULTATION_RELAY_URL: CONSULT_URL,
  CONSULTATION_RELAY_SECRET: CONSULT_SECRET,
};

const intents = ["consultation", "diagnosis", "gift", "personal_review"];
const expected = {
  consultation: { route: "consultation_ingress", host: "127.0.0.1:3922", secret: CONSULT_SECRET },
  diagnosis: { route: "legacy_relay", host: "127.0.0.1:3921", secret: LEGACY_SECRET },
  gift: { route: "legacy_relay", host: "127.0.0.1:3921", secret: LEGACY_SECRET },
  personal_review: { route: "legacy_relay", host: "127.0.0.1:3921", secret: LEGACY_SECRET },
};

const legacyHits = [];
const consultHits = [];
const legacyServer = await startMock(3921, legacyHits);
const consultServer = await startMock(3922, consultHits);

try {
  for (const intent of intents) {
    const resolved = resolveTelegramRelay({ intent }, env);
    assert.equal(resolved.route, expected[intent].route, `route ${intent}`);
    assert.equal(new URL(resolved.url).host, expected[intent].host, `host ${intent}`);
    assert.equal(resolved.secret, expected[intent].secret, `secret ${intent}`);
  }

  const def = resolveTelegramRelay(
    { intent: "consultation" },
    { CONSULTATION_RELAY_SECRET: CONSULT_SECRET },
  );
  assert.equal(def.url, CONSULTATION_RELAY_URL_DEFAULT);
  assert.equal(def.route, "consultation_ingress");

  const remapped = telegramRelayEnv({
    TELEGRAM_RELAY_URL: "https://ksenia-telegram-relay.marygold60588.workers.dev",
    TELEGRAM_RELAY_SECRET: LEGACY_SECRET,
  });
  assert.equal(remapped.url, SITE_LEADS_RELAY_URL_DEFAULT);
  const remappedIngress = telegramRelayEnv({
    TELEGRAM_RELAY_URL: "https://ksenia-ahmedova-leads-ingress.marygold60588.workers.dev",
    TELEGRAM_RELAY_SECRET: LEGACY_SECRET,
  });
  assert.equal(remappedIngress.url, SITE_LEADS_RELAY_URL_DEFAULT);

  for (const intent of intents) {
    legacyHits.length = 0;
    consultHits.length = 0;
    const resolved = resolveTelegramRelay({ intent }, env);
    const result = await postRelay(resolved.url, resolved.secret, `routing-test ${intent}`);
    assert.equal(result.status, 200);
    if (intent === "consultation") {
      assert.equal(consultHits.length, 1);
      assert.equal(legacyHits.length, 0);
      assert.equal(consultHits[0].auth, `Bearer ${CONSULT_SECRET}`);
    } else {
      assert.equal(legacyHits.length, 1);
      assert.equal(consultHits.length, 0);
      assert.equal(legacyHits[0].auth, `Bearer ${LEGACY_SECRET}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        tested_intents: intents,
        routes: Object.fromEntries(intents.map((i) => [i, resolveTelegramRelay({ intent: i }, env).route])),
        real_telegram: false,
      },
      null,
      2,
    ),
  );
} finally {
  await Promise.all([
    new Promise((r) => legacyServer.close(r)),
    new Promise((r) => consultServer.close(r)),
  ]);
}
