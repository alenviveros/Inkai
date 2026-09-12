# Inkai — /app (el software)

Este es el mapa del software. El negocio — por qué, para quién, qué se decidió — vive **arriba**,
en `../01_negocio` y `../02_producto`. Acá solo se construye lo que un brief aprobado pide.

## Dos paquetes, un contrato
- `web/` — el dashboard admin. Next.js 15 + shadcn + Supabase. Lo usa el admin de Printos: ve la
  cola, Modificar, Confirmar (= pago recibido), Marcar terminado, derivaciones. **No llama al bot**;
  para el aviso de terminado (brief 005) llama directo a la API de Telegram.
- `bot/` — el agente de Telegram, framework Eve. Recibe al cliente, arma el pedido con tools, lo
  escribe en Supabase. **No llama al dashboard.**
- Se hablan **solo por Supabase**. El contrato (tabla `pedidos`, estados) está en
  `../recursos/stack.md`. Si uno de los dos necesita algo que no está en el contrato, primero se
  cambia el contrato.
- `supabase/` — la migración de `pedidos` (`migrations/`): el contrato hecho SQL. Vive acá y no en `web/`
  porque `create-next-app` rechaza una carpeta con archivos previos.

## Arranque (pasos 1 a 5 hechos; falta el deploy)
En este orden, cada paso cubierto por un brief aprobado:
1. **Supabase primero — hecho (2026-09-12):** proyecto y tabla `pedidos` creados; la migración
   vive en `supabase/migrations/`. Datos del proyecto, cómo se aplicó y estado: `../recursos/stack.md`.
2. **`bot/` — probado (2026-09-12):** `agent/agent.ts` con
   `anthropic("claude-sonnet-5")` · `agent/instructions.md` desde el brief 001 + `catalogo.md` +
   `printos.md` · tools `crear_pedido` / `actualizar_pedido` sobre `agent/lib/pedidos.ts`, que
   escriben en Supabase. La charla del demo del brief llega a pendiente de pago. `derivar` espera al
   brief 003 (borrador). Para hablarle: `npm run dev` en `bot/` abre el TUI; el servidor
   `inkai-bot` de `../.claude/launch.json` lo levanta sin TUI en el puerto 2000. El canal
   Telegram es el brief 002.
3. **`web/` — probado (2026-09-12):** Next 15.5 + shadcn `radix-nova`.
   `app/page.tsx` lee la cola y `components/cola.tsx` la mantiene en vivo con Realtime, en tres
   columnas: borrador, pendiente de pago, en cola. `app/actions.ts` tiene Confirmar y Modificar;
   Modificar lee la corrección en lenguaje natural con el AI SDK. Las reglas del pedido están en
   `lib/pedidos.ts`, copia de las del bot. Typecheck, lint y build: OK. Probado en el
   navegador con el bot al lado: un pedido nuevo del bot aparece solo, Modificar cambia campos y
   rechaza papel incompatible, Confirmar lo pasa a la cola. Se levanta con el servidor
   `inkai-web` de `../.claude/launch.json` (puerto 3000). En `next dev`, Confirmar tardó unos
   5 s: medirlo con `npm run build` + `npm start` antes de grabar.
4. **Telegram (brief 002) — probado desde un celular (2026-09-12):** canal en
   `bot/agent/channels/telegram.ts`; el archivo del cliente se sube a Storage desde las tools y se
   abre desde la tarjeta del panel. Probado por la API HTTP de Eve con un PDF real: pedido creado,
   archivo en el bucket, link del panel OK. Para grabar: bot + túnel + webhook, según
   `../recursos/stack.md`.
5. **Terminado y aviso (brief 005) — probado desde un celular (2026-09-12):** botón "Marcar terminado" y columna
   Terminados en el panel; `web/app/actions.ts` pasa el pedido de en cola a terminado y avisa por
   Telegram con `web/lib/telegram.ts`. El bot anota el chat del cliente en el pedido. El aviso llegó
   al celular. El aviso sale una sola vez: si se marca terminado sin token, no hay reenvío.
6. **Deploy:** `eve link` + `eve deploy` para el bot, `setWebhook` de Telegram; Vercel para la web.

## Regla de entrada
Si te piden construir algo y no hay un brief en `../02_producto/briefs/` con `estado: aprobado`
que lo cubra, **frená y pedilo**. No lo escribas vos: el brief es el chequeo humano del límite.

## Antes de escribir código de Eve
Nadie del equipo usó Eve. Está en preview y su API cambia. La fuente de verdad son los docs que
viajan con el paquete: `bot/node_modules/eve/docs/README.md` (índice) — no la memoria ni
internet. La skill `eve` dice lo mismo.

## Routing
| Tarea | Leé |
|---|---|
| Qué construir y qué NO | el brief que aplica en `../02_producto/briefs/` — solo ese |
| Qué ofrece Printos, campos del pedido, cómo habla | `../recursos/catalogo.md` · `../recursos/printos.md` |
| Stack, contrato bot↔dashboard, env vars, riesgos | `../recursos/stack.md` |
| El agente: instrucciones, tools, canal Telegram, HITL | skill `eve` → `bot/node_modules/eve/docs/` (`channels/telegram.mdx`, `tools/overview.mdx`, `tools/human-in-the-loop.md`, `agent-config.md`) |
| Llamar al modelo, tools tipadas, structured output | skill `ai-sdk` |
| Dashboard: componentes, tema, avisos | shadcn/ui (`npx shadcn@latest add …`) · `sonner` · `next-themes` |
| Base, realtime, auth | Supabase — si el MCP de Supabase está conectado en la sesión, usalo |
| Deploy | `bot/`: `eve link` + `eve deploy` · `web/`: Vercel conectado a Git |
| Entregar | `../recursos/evento.md` |

## Reglas
- Un hogar por hecho: las reglas de negocio (campos, estados, qué pasa si falta uno) viven en el
  brief y en `catalogo.md`. El código apunta en un comentario; no las reescribe. El prompt del
  agente (`bot/agent/instructions.md`) **sí** las dice en sus palabras — y apunta al brief.
- Al terminar un brief: `estado: implementado` en el brief. Si construyendo se descubrió algo que
  cambia el negocio, una línea en `../01_negocio/decisiones.md` — no se decide desde acá.
- TypeScript strict. `tsc --noEmit` en el paquete tocado antes de decir que algo funciona.
- Código, commits y README en inglés.
- Ningún `.env*` se abre ni se escribe desde el agente: los valores los carga Alen.
