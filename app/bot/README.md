# Inkai bot

The customer-facing agent: an [eve](https://eve.dev) agent on Telegram that turns a chat into a print
order in Supabase. See the [root README](../../README.md) for the full picture.

- `agent/instructions.md` — the system prompt (rules from `02_producto/briefs/001` and `002`).
- `agent/tools/` — `crear_pedido` and `actualizar_pedido`, the only way the agent writes an order.
- `agent/lib/` — order rules, Supabase access, file uploads, per-chat session state.
- `agent/channels/telegram.ts` — Telegram channel, file upload policy, saves the chat on the order.
- `scripts/telegram-webhook.mjs` — registers the Telegram webhook at a public URL.

```bash
npm install
npm run dev -- --no-ui --port 2000
```

`.env.local`: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_WEBHOOK_SECRET_TOKEN`.
