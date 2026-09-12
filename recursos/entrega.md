# Entrega — textos para el formulario del hackathon

Listos para copiar y pegar. Van en inglés porque el jurado es global. Completar los dos
`[completar]` antes de enviar: el aporte de Mauro y el link del video.

---

## Project title

Print.ai

## Project description

Print.ai is an order-taking agent for busy print shops, built for Printos Super Impresiones, a real
24-hour print shop in Asunción, Paraguay. It lives in the two places where print orders already
happen: the customer's Telegram chat and the shop's live order board.

The problem: orders arrive as messy conversations. The quantity comes in one message, the file in
another, "for tomorrow" in a third. At peak hours staff retype every chat into a work order, chase
the missing details and check by hand that the bank transfer arrived before printing. Orders get
delayed, mixed up or lost.

On Telegram, the customer writes the way they would talk to the counter and sends the PDF or photo
in the same chat. The agent turns it into a structured order card (quantity, size, color, file,
pickup or delivery, date), marks every missing field instead of inventing a value, and asks only for
what is missing. Each chat is a durable session, so the customer can answer an hour later and the
agent still knows the order. The card appears live on the shop's board. There, the admin opens the
customer's file, corrects the card in plain Spanish, confirms the transfer and marks the job
finished, which sends the customer a Telegram message with the order number to pick it up.

Why the environment matters: a standalone chatbot can only talk. Here the conversation becomes a row
in the production queue with nobody retyping it, the file travels with the order, and the customer
never installs or opens anything new. The environment also shapes the core workflow: the chat is
where data is collected and the panel is where a person decides. Nothing reaches production until a
human confirms the payment.

Technical execution: the agent is built with Eve, Vercel's durable agent framework, using its
Telegram channel, typed tools and per-chat sessions, and runs Anthropic Claude Sonnet 5 through the
Vercel AI SDK. Business rules are enforced in code, not only in the prompt: a closed catalog,
required fields, paper and size compatibility, and guarded state transitions from draft to pending
payment, production queue and finished. The admin panel is Next.js 15 with React 19, TypeScript,
Tailwind CSS and shadcn/ui, updated live with Supabase Realtime. Supabase Postgres with row-level
security is the only contract between the bot and the panel, and Supabase Storage keeps customer
files in a private bucket opened through short-lived signed links. "Modificar" uses AI SDK
structured output to turn the admin's correction into a validated field diff. For the demo, a
Cloudflare Tunnel exposes the local bot to Telegram's webhook.

## Products & Tools Used

Marcar solo lo que de verdad se usó:

- [x] AI Tinkerers
- [ ] OpenAI, CopilotKit, OpenRouter, Exa, Trigger.dev, Auth0, Mozilla.ai, Ambiguous AI, NVIDIA:
  no se usan en el producto final. CopilotKit, OpenAI y OpenRouter se evaluaron a la mañana y se
  reemplazaron (ver `../01_negocio/decisiones.md`).

**Other Products:**

Anthropic Claude (Claude Sonnet 5 API), Claude Code, Vercel Eve, Vercel AI SDK, Next.js, React,
shadcn/ui, Tailwind CSS, Supabase (Postgres, Realtime, Storage), Telegram Bot API, Cloudflare Tunnel

## Team Contributions

**Alen Martínez:** product and business definition: the Printos use case, its catalog, policies and
voice, plus the decision log and the briefs that scoped the demo. Built and tested the product end
to end with Claude Code: the Eve agent on Telegram running Claude Sonnet 5 through the Vercel AI SDK,
file handling from Telegram into Supabase Storage, the Supabase schema and Realtime, the Next.js
admin panel, and the "order ready" notice through the Telegram Bot API.

**Mauro Vera:** [completar]

No sponsor APIs are used in the final build. We explored the CopilotKit starter kit early in the day
and replaced it with Eve and the Vercel AI SDK before writing product code.

## Additional Links

- GitHub repository: https://github.com/alenviveros/Inkai
- Demo video: [completar]

## Prior work

All product code in this repository (`app/bot`, `app/web` and `app/supabase`) was written during
the hackathon, on September 12, 2026. It builds on open-source frameworks and hosted services: Eve,
the Vercel AI SDK, Next.js, shadcn/ui and Supabase. We cloned the CopilotKit starter kit in the
morning and replaced it with our own stack before writing product code; no code from the kit
remains.

Prepared before the event: the ICM method, Alen's folder-and-brief structure we used to organize the
project (visible in `01_negocio`, `02_producto` and `recursos`), and first-hand information about
Printos Super Impresiones, such as its welcome message and its paper and size sheets. Claude Code was
used as a coding assistant throughout.
