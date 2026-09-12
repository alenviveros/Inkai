# Entrega — textos para el formulario del hackathon

Listos para copiar y pegar, en inglés porque el jurado es global. Falta solo el link del video.

---

## Project title

Inkai

## Project description

Inkai is a working AI agent that takes print orders where they already happen: in the customer's Telegram chat and on the print shop's live order board. We built it for Printos Super Impresiones, a real 24-hour print shop in Asunción, Paraguay.

The problem. Print orders arrive as messy conversations: the quantity in one message, the file in another, "for tomorrow" in a third. At peak hours, staff retype every chat into a work order, chase missing details, and check by hand that the bank transfer arrived before printing. Orders get delayed, mixed up or lost.

A functional agent in its environment. On Telegram, the customer writes naturally and sends the PDF or photo in the same chat. The agent turns the conversation into a structured order card with quantity, size, color, file, pickup or delivery, and date. It flags every missing field instead of inventing a value, and asks only for what is missing. The order appears instantly on the shop's board. The admin opens the customer's file, corrects the card in plain Spanish, confirms the transfer, and marks the job finished. At that moment the customer receives a Telegram message with the order number to pick it up. The whole loop runs end to end from a real phone.

Why this beats a standalone chatbot. A standalone chatbot can only answer. Inkai acts inside the shop's workflow: the conversation becomes a row in the production queue with nobody retyping it, the file travels with the order, and the customer never installs or opens anything new. The agent also closes the loop by writing back to the customer when the job is done.

Innovation, and how the environment shapes the workflow. Each place does what it is best at. The chat is where incomplete data is collected over time: every Telegram chat is a durable session, so a customer can answer a missing field an hour later and the agent still knows the order. The board is where a person decides: nothing reaches production until a human confirms the payment. The AI proposes and a person confirms; the agent never quotes prices or skips a step.

Technical execution. The agent is built with Eve, Vercel's framework for durable agents, using its Telegram channel, typed tools, per-chat session state and inbound file handling. It runs Anthropic Claude Sonnet 5 through the Vercel AI SDK. Business rules are enforced in code, not only in the prompt: a closed catalog, required fields, paper and size compatibility, and a guarded state machine from draft to pending payment, production queue and finished. Customer files are recognized by their bytes and stored in a private Supabase Storage bucket, opened from the board through short-lived signed links. The admin panel uses Next.js 15 with the App Router and server actions, React 19, TypeScript, Tailwind CSS 4 and shadcn/ui on Radix, with Supabase Realtime keeping the board live. Supabase Postgres with row-level security is the only contract between the bot and the panel. The admin's natural-language corrections go through AI SDK structured output with Zod schemas and come back as a validated field diff. The order-ready notice uses the Telegram Bot API, and a Cloudflare Tunnel exposes the local bot to Telegram's webhook for the demo.

Clear value and an intuitive experience. The customer just chats, the way they already talk to the counter, and always sees an order card that shows exactly what is confirmed and what is missing. The admin gets a board with a clear next action at each stage: open the file, fix the card in words, confirm payment, mark finished. No forms, no retyping, and no order lost between a chat and the production queue.

## Products & Tools Used

Marcar solo **AI Tinkerers**. OpenAI, CopilotKit y OpenRouter se evaluaron a la mañana y no quedaron
en el producto final (`../01_negocio/decisiones.md`); el resto de la lista no se usó.

**Other Products:**

Anthropic Claude (Claude Sonnet 5 API), Claude Code, Vercel Eve, Vercel AI SDK, Next.js, React,
shadcn/ui, Tailwind CSS, Supabase (Postgres, Realtime, Storage), Telegram Bot API, Cloudflare Tunnel

## Team Contributions

Mauro Vera: the problem and the operating flow, with its business logic. He mapped how a busy print
shop receives, checks and produces orders, and turned it into the rules the agent follows: the order
fields and the closed catalog, asking for missing data instead of inventing it, prior bank transfer
before production, the order states from draft to finished, and first-come, first-served attention.

Alen Martínez: the technology stack and its implementation, built end to end with Claude Code. That
covers the Eve agent on Telegram running Anthropic Claude Sonnet 5 through the Vercel AI SDK, file
handling from Telegram into Supabase Storage, the Supabase schema with row-level security and
Realtime, the Next.js and shadcn/ui admin panel, and the order-ready notice through the Telegram Bot
API.

No sponsor APIs are used in the final build. We explored the CopilotKit starter kit early in the day
and replaced it with Eve and the Vercel AI SDK before writing product code.

## Additional Links

- GitHub repository: https://github.com/alenviveros/Inkai
- Demo video: [completar]

## Prior work

All product code in this repository (app/bot, app/web and app/supabase) was written during the
hackathon, on September 12, 2026. It builds on open-source frameworks and hosted services: Eve, the
Vercel AI SDK, Next.js, shadcn/ui and Supabase. We cloned the CopilotKit starter kit in the morning
and replaced it with our own stack before writing product code; no code from the kit remains.

Prepared before the event: the ICM method, Alen's folder-and-brief structure we used to organize the
project (visible in 01_negocio, 02_producto and recursos), and first-hand information about Printos
Super Impresiones, such as its welcome message and its paper and size sheets. Claude Code was used as
a coding assistant throughout.
