# Print.ai admin panel

The print shop's live order board: Next.js 15, shadcn/ui and Supabase Realtime. See the
[root README](../../README.md) for the full picture.

- `app/page.tsx` + `components/cola.tsx` — the board, updated live by Supabase Realtime.
- `components/tarjeta-pedido.tsx` — the order card: open file, Modificar, Confirmar pago, Marcar terminado.
- `app/actions.ts` — server actions; Modificar uses AI SDK structured output with Claude.
- `app/archivo/[id]/route.ts` — opens the customer's file through a short-lived signed link.
- `lib/telegram.ts` — tells the customer on Telegram that the order is ready.

```bash
npm install
npm run dev
```

`.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`,
`TELEGRAM_BOT_TOKEN`.
