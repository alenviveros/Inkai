// Points the Telegram bot at this agent (brief 002).
// Usage, from app/bot:  node scripts/telegram-webhook.mjs https://<public-url>
// Reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET_TOKEN from .env.local and never prints them.
import { existsSync } from "node:fs";

const base = process.argv[2]?.replace(/\/+$/, "");
if (!base?.startsWith("https://")) {
  console.error("Usage: node scripts/telegram-webhook.mjs https://<public-url>");
  process.exit(1);
}
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN;
if (!token || !secret) {
  console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET_TOKEN in .env.local");
  process.exit(1);
}

const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  }).then((res) => res.json());

const me = await api("getMe");
if (!me.ok) {
  console.error(`Telegram rejected the token: ${me.description}`);
  process.exit(1);
}
const url = `${base}/eve/v1/telegram`;
const set = await api("setWebhook", {
  url,
  secret_token: secret,
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
});
if (!set.ok) {
  console.error(`Telegram error: ${set.description}`);
  process.exit(1);
}
console.log(`Webhook set for @${me.result.username}: ${url}`);
