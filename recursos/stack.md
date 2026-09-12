# Stack — lo fijo, y cómo se conectan las piezas

_Reemplaza al stack del starter kit de CopilotKit. El porqué del cambio: `../01_negocio/decisiones.md`._

## La forma
Dos paquetes en `/app`, que se hablan **solo por Supabase**:

```
Cliente (Telegram) ──webhook──▶ app/bot (Eve) ──tool crear_pedido──▶ Supabase (tabla pedidos)
                                                                            │ Realtime
Admin (navegador) ◀──────────── app/web (Next.js dashboard) ◀──────────────┘
                                Confirmar = estado → en_cola
```

- **`app/bot`** — el agente. Framework **Eve** (Vercel): canal Telegram incluido, sesión durable
  por chat (recuerda la charla entre mensajes), tools tipadas, human-in-the-loop con botones.
  Modelo: Anthropic directo.
- **`app/web`** — el dashboard admin. Next.js + shadcn + Supabase Realtime. No habla con el bot:
  lee y escribe la base.
- **Supabase** — el único punto de contacto. El bot escribe pedidos; el dashboard los muestra y
  cambia su estado.

## Versiones (tabla de Alen)
| Capa | Herramienta | Versión |
|---|---|---|
| Framework web | Next.js, App Router + React Server Components | 15.5.25 |
| UI runtime | React | 19 |
| Lenguaje | TypeScript, `strict` | 5.7 |
| Componentes | shadcn/ui estilo `radix-nova`, base neutral, variables CSS, sobre Radix UI | radix-ui 1.6 |
| Estilos | Tailwind CSS v4 vía `@tailwindcss/postcss` + tw-animate-css | 4.0 |
| Iconos | lucide-react | 0.475 |
| Backend, DB, Realtime | Supabase: `@supabase/supabase-js` | 2.116 |
| Validación | Zod | 4.x |
| Sesiones propias (opcional) | jose (JWT) · bcryptjs | 5.9 / 3.0 |
| Avisos en pantalla | sonner | 2.0 |
| Tema claro/oscuro | next-themes | 0.4 |
| PDF / Excel | @react-pdf/renderer · exceljs | 4.3 / 4.4 |
| Tests | Vitest, entorno node | 3.0 |
| Hosting | Vercel, funciones en la región más cercana a la base | plan gratuito |
| **Agente** | **Eve** (`eve`) + AI SDK (`ai`) + `@ai-sdk/anthropic` | 0.54 (preview) |
| IA del panel (Modificar) | AI SDK (`ai`) + `@ai-sdk/anthropic`, salida estructurada | 7 / 4 |
| Modelo | Anthropic `claude-sonnet-5`, key directa | — |
| Runtime | Node.js | ≥ 24 (Eve lo exige; hay 24.13) |

Dónde se apartó de la tabla original (2026-09-12), y por qué:
- **Next 15.3 → 15.5.25:** 15.3.9 tenía vulnerabilidades críticas publicadas, entre ellas ejecución
  remota en servidores Windows. 15.5 sigue siendo Next 15. Queda un aviso de `npm audit` por el
  `postcss` que Next trae adentro: solo procesa nuestro CSS al compilar, y la corrección es Next 16.
- **shadcn `new-york` → `radix-nova`:** el CLI actual ya no tiene `new-york`; `nova` es su estilo base.
- **Sin `@supabase/ssr`:** sirve para sesiones con cookies, y el panel no tiene login (brief 001).
- **Zod 4:** el AI SDK 7 pide Zod ≥ 3.25.76; se alinea con el bot, que ya usa Zod 4.

## Eve: lo verificado en sus docs (v0.54.3, `node_modules/eve/docs/`)
- **Telegram viene incluido:** `agent/channels/telegram.ts` con `telegramChannel({ botUsername })`.
  Monta `POST /eve/v1/telegram`. Env: `TELEGRAM_BOT_TOKEN` y `TELEGRAM_WEBHOOK_SECRET_TOKEN`.
  El `setWebhook` lo registrás vos con un curl (está en `docs/channels/telegram.mdx`).
- **Chats privados:** texto, fotos y documentos entran. Adjuntos (PDF, imagen) se bajan con
  `uploadPolicy`. Sirve para "Archivo adjunto" del catálogo.
- **HITL en Telegram:** las preguntas con opciones se vuelven botones inline (para preguntar
  "¿A4 o A3?"). Confirmar el pago **no** va por acá: va por el dashboard.
- **Modelo directo:** `model: anthropic("claude-sonnet-5")` en `agent/agent.ts`, con
  `npm i @ai-sdk/anthropic` y `ANTHROPIC_API_KEY`. Sin gateway, sin otra billetera. (Un string
  tipo `anthropic/claude-sonnet-5` iría por AI Gateway — no usar.)
- **Sesión durable por chat:** cada cliente de Telegram es una sesión que recuerda la conversación
  (pedir un faltante y que lo responda después funciona solo). Local: se persiste en
  `.eve/.workflow-data`. En Vercel: Vercel Workflow.
- **Layout** (dentro de `app/bot/`): `agent/instructions.md` (prompt) · `agent/agent.ts` (modelo)
  · `agent/tools/*.ts` (una tool por archivo, el nombre sale del path) · `agent/channels/telegram.ts`.
- **Comandos:** `npx eve@latest init bot` · `npm run dev` (TUI local) · `eve link` + `eve deploy`.
- **Lo que salió construyendo (2026-09-12):** `eve init` crea un `.git` propio dentro de `app/bot`;
  sobra, porque el repo es la raíz: se borró. Si se vuelve a correr `eve init`, borrarlo de nuevo (está
  oculto; en PowerShell, `Remove-Item -Recurse -Force`). `defaultTools: false` en `agent.ts` deja al bot solo con sus
  tools: sin shell, archivos, web ni subagentes. El pedido de cada charla se guarda con
  `defineState` (`eve/context`), así una charla solo toca su propio pedido. La fecha de Asunción
  entra por una instrucción dinámica por turno (`agent/instructions/ahora.ts`).
- **Telegram y archivos (brief 002, 2026-09-12):** canal en `agent/channels/telegram.ts`, que deja
  pasar fotos y PDF de hasta 20 MB. Eve los guarda en `/workspace/attachments/<hash>/<nombre>`; sin
  Docker, en Windows, ese espacio lo simula `just-bash`, instalado como dependencia. Las tools
  buscan el archivo nuevo, lo reconocen por sus primeros bytes, lo suben al bucket `archivos` y
  guardan la ruta en `archivo_path` (`agent/lib/adjuntos.ts`). El panel lo abre con un link firmado
  de 60 s (`app/web/app/archivo/[id]/route.ts`).
  Trampa encontrada con el primer PDF real: eve revisa `allowedMediaTypes` también contra la
  respuesta de descarga, y Telegram sirve todo como `application/octet-stream`. Sin ese tipo en la
  lista, cada archivo se rechaza y el agente solo recibe "could not be retrieved".
- **Aviso de terminado (brief 005):** el canal anota el chat del cliente en `telegram_chat_id` al
  terminar cada turno (`events["turn.completed"]` en `agent/channels/telegram.ts`, un evento sin
  manejador propio de eve). El panel manda el aviso directo a la API de Telegram
  (`app/web/lib/telegram.ts`): no llama al bot, y el aviso no depende de que el túnel esté abierto.
- **Telegram sin deploy, para grabar:** `cloudflared tunnel --url http://localhost:2000` da una URL
  pública temporal, y `node scripts/telegram-webhook.mjs <url>`, desde `app/bot`, registra el
  webhook leyendo el token de `.env.local` sin mostrarlo. La URL cambia cada vez que se abre el
  túnel, así que hay que volver a registrarla.
  Probado el 2026-09-12 con @ekopia_bot. Ojo: con el túnel abierto, además de `/eve/v1/telegram`
  (que exige la clave secreta) queda abierta la API HTTP del bot (`/eve/v1/session`, `/eve/v1/info`),
  porque la auth `localDev()` de `agent/channels/eve.ts` ve el tráfico del túnel como local. Quien
  tenga la URL puede abrir sesiones y gastar la key de Anthropic: cerrar el túnel al terminar.
- **Riesgos anotados:** es preview (0.x; la API puede cambiar) · exige Node 24 · en Vercel usa
  Vercel Workflow — **verificar en el primer deploy que el plan gratuito lo permita**; si no,
  plan B: `eve start` self-hosted (servidor Node) en Railway/Fly/Render con URL pública.
  Ese primer deploy es el freno 2.

## Contrato entre bot y dashboard (una sola tabla para empezar)
`pedidos`: `id` (correlativo) · `estado` (`borrador` → `pendiente_pago` → `en_cola` → `terminado`; `derivado`)
· `cantidad` · `tamano` · `color` · `archivo` (tipo, o null) · `archivo_path` (ruta del archivo en Storage, o null) · `papel` (null si no lo dijo) ·
`entrega` (`retiro` | `delivery`) · `fecha` · `hora` · `telegram_chat_id` · `motivo_derivacion` ·
`created_at`. Un campo obligatorio en null **es** un faltante.
Los campos son los del brief 001 y `catalogo.md`. El bot escribe; el dashboard actualiza
`estado`. El esquema real vive en `app/supabase/migrations/` — esto es el contrato, no la
migración.
RLS activo: el bot escribe con la service role (salta RLS); el dashboard, con la anon key, lee y
actualiza pedidos, pero no crea ni borra (policies en la migración). Actualiza campos, no solo
`estado`, porque Modificar corrige la tarjeta. Realtime: `pedidos` está en la publicación `supabase_realtime`.
`fecha` y `hora` van separadas: el cliente suele dar el día sin la hora ("para mañana") y una sola
columna obligaría a inventar una. `hora` en null = no la dijo; no es un faltante.

## Supabase — el proyecto (datos no secretos; Alen los completa)
- Nombre del proyecto: hackthon print
- Project ref: `sjymrgzyvyzhrlunzplt` — es lo que el MCP de Supabase necesita para operar sobre él
- Región: `sa-east-1` (São Paulo) — la de Vercel se elige igual a esta
- URL: https://sjymrgzyvyzhrlunzplt.supabase.co
- Estado de la tabla `pedidos`: **creada** (2026-09-12). Migraciones en `app/supabase/migrations/`, en
  orden: `20260912000000_pedidos.sql` (aplicada por la Management API) y
  `20260912010000_pedidos_split_fecha_hora.sql` (por el MCP) y
  `20260912020000_archivos_adjuntos.sql` (por el MCP): columna `archivo_path`, bucket privado
  `archivos` y permiso de lectura para la anon key. Después, `20260912030000_pedidos_estado_terminado.sql`
  (por el MCP) suma el estado `terminado` del brief 005. El MCP de Supabase está conectado a la
  cuenta dueña del proyecto: las operaciones van por ahí.
Las keys (anon, service role) **no van acá**: van a los `.env` de abajo.

## Variables de entorno
- `app/bot/.env.local` (`eve dev` lo carga solo; `.env` no): `ANTHROPIC_API_KEY` (Alen ya la tiene) · `TELEGRAM_BOT_TOKEN` ·
  `TELEGRAM_WEBHOOK_SECRET_TOKEN` · `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` (el bot escribe
  desde el servidor).
- `app/web/.env.local`: `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` ·
  `ANTHROPIC_API_KEY` (solo del lado del servidor: la usa Modificar para leer la corrección en lenguaje natural) ·
  `TELEGRAM_BOT_TOKEN`, el mismo del bot, también solo del servidor: con él el panel avisa al cliente
  que su pedido está terminado (brief 005).
Ningún `.env*` se sube ni se abre desde el agente. Los valores los carga Alen.

## Skills instaladas (en `.claude/skills/`)
- `ai-sdk` — el AI SDK: providers, tools, structured output.
- `eve` — apunta a los docs empaquetados en `app/bot/node_modules/eve/docs/`. Leer antes de
  escribir código de Eve.
