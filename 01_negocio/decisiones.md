# Decisiones

> Una entrada por decisión. **Lo más nuevo arriba.** Una decisión no se borra: si cambia, se agrega
> una nueva que la reemplaza y dice a cuál reemplaza.

## 2026-09-12 — El producto se llama Inkai
**Qué:** Print.ai pasa a llamarse **Inkai**: README, textos de entrega, mapas, panel, bot y el repo
público (`github.com/alenviveros/Inkai`). Las entradas de abajo dicen Print.ai porque así se
llamaba cuando se decidieron.
**Por qué:** lo decidió Alen para el video y la entrega.
**Reemplaza:** el nombre Print.ai.

## 2026-09-12 — Estado terminado y aviso al cliente con su número de pedido
**Qué:** se aprueba el brief 005. El admin marca terminado un pedido de la cola, y el cliente que
pidió por Telegram recibe un aviso con su número de pedido para retirarlo.
**Por qué:** lo pidió Alen para el video: el recorrido cierra cuando el cliente sabe que puede
retirar.
**Descartado:** un estado "entregado" o "retirado" después de terminado: no suma al video.

## 2026-09-12 — Telegram entra al demo con el archivo visible en el panel
**Qué:** se aprueba el brief 002 y se le suma que el archivo que manda el cliente, foto o PDF, se
abre desde la tarjeta en el panel. Lo construye Claude con Alen.
**Por qué:** Alen necesita que el recorrido completo funcione en el video, archivo incluido.
**Descartado:** un brief aparte para el archivo: más pasos para el mismo resultado en el video.

## 2026-09-12 — Sin login en todo el demo, también deployado
**Qué:** ni el panel ni ninguna otra parte del demo lleva login, tampoco cuando esté en internet.
**Por qué:** lo decidió Alen. Sigue el alcance del brief 001, que deja el login afuera.
**Riesgo asumido:** quien tenga la URL del panel puede ver pedidos, modificarlos, confirmar pagos y
gastar la key de Anthropic con Modificar.
**Descartado:** protección con contraseña de Vercel · login con Supabase Auth.

## 2026-09-12 — Supabase listo: migración en `app/supabase/`, dashboard con anon key y RLS acotado
**Qué:** el proyecto es `hackthon print` (`sjymrgzyvyzhrlunzplt`, `sa-east-1`); datos y estado en
`../recursos/stack.md`. La tabla `pedidos` existe; su migración vive en `app/supabase/migrations/`,
no en `app/web/`. Sin login (brief 001), el dashboard usa la anon key con RLS que solo deja leer y
actualizar; el bot escribe con la service role, que salta RLS.
**Por qué:** `create-next-app` rechaza una carpeta con archivos previos, y la migración es el
contrato de los dos paquetes, no de uno. Anon con RLS acotado es lo mínimo para un demo sin
usuarios sin dejar la tabla abierta a inserts o borrados desde el navegador.
**Descartado:** el dashboard con la service role desde el servidor (más seguro, pero suma un env
var y código server-only que el 001 no pide) · RLS apagado.

## 2026-09-12 — El bot es Eve; el dashboard es Next.js; se hablan por Supabase
**Qué:** `app/bot` es un proyecto Eve (framework de agentes de Vercel) con el canal Telegram que
trae incluido, tools tipadas y modelo Anthropic directo (`anthropic("claude-sonnet-5")`).
`app/web` es el dashboard Next.js. No se llaman entre sí: el bot escribe pedidos en Supabase, el
dashboard los lee (Realtime) y cambia el estado. Contrato en `../recursos/stack.md`.
**Por qué:** Eve resuelve lo que a mano costaría más: webhook de Telegram con secreto, sesión
durable por chat (el cliente contesta un faltante diez minutos después y el agente se acuerda),
adjuntos, botones de opciones. Verificado en sus docs empaquetados (`channels/telegram.mdx`),
no en su README. Y acepta la key de Anthropic directa, sin gateway.
**Riesgo asumido:** Eve es preview (0.54) y pide Node 24 (hay). En Vercel usa Vercel Workflow;
si el plan gratuito no lo permite, plan B: `eve start` self-hosted en Railway/Fly. El primer
deploy es el freno 2.
**Descartado:** AI SDK a pelo + grammY en una ruta de Next.js (funciona, pero el estado de la
conversación y los botones son código nuestro) · Eve con modelo por AI Gateway (otra billetera).

## 2026-09-12 — Dejamos CopilotKit y el starter kit: stack propio Next.js + Supabase + AI SDK
**Qué:** se borró `/app` entero. Print.ai se construye desde cero como **una app Next.js 15**
(App Router, React 19, TypeScript strict, shadcn/ui + Tailwind 4) con **Supabase** (base,
auth, storage, realtime), desplegada en **Vercel**. El agente usa el **AI SDK de Vercel** con
la key de **Anthropic directa** (`@ai-sdk/anthropic`, modelo `claude-sonnet-5`). Stack completo
con versiones: `../recursos/stack.md`.
**Por qué:** nos confundimos. El kit es un *copiloto embebido en una superficie* (chat con
generative UI adentro de una app de incidentes). Print.ai es otra cosa: **un bot de Telegram que
escribe pedidos en una base, y un dashboard que los lee y donde una persona confirma**. Es
CRUD + un agente con tools, no un copiloto. Pelear contra el kit para sacarle el dominio de
incidentes costaba más que armar lo nuestro. Y la key de Anthropic ya está en mano.
**Descartado:** seguir con CopilotKit (premio especial incluido: un demo que anda vale más) ·
OpenRouter (sin saldo) · OpenAI directo (sin key).
**Reemplaza:** "Construir sobre el starter kit de CopilotKit" · "Modelo de OpenAI vía
OpenRouter" · la parte técnica de "Estrategia C+B" (ver la decisión siguiente) · la base
técnica de "Voz entra: brief 004" — la ruta `/voice` del kit ya no existe, el brief 004
vuelve a borrador hasta decidir cómo se hace la voz.

## 2026-09-12 — Telegram por webhook es la puerta principal, no un spike
**Qué:** el bot de Telegram recibe cada mensaje por **webhook** en una ruta de la misma app
Next.js. Vercel da la URL pública gratis, así que ya no hace falta ngrok ni un proceso
escuchando. El pedido que el agente arma se guarda en Supabase y el dashboard lo muestra al
instante (Realtime). El brief 002 deja de ser "spike con corte" y pasa a ser la entrada
principal del cliente; el freno 2 de `../02_producto/CONTEXT.md` sigue como red de seguridad.
**Por qué:** la razón para tratar Telegram como riesgo era la ruta directa sin documentar del
kit más el túnel. Con webhook en Vercel es la parte más estándar del sistema.
**Descartado:** polling local (no anda en Vercel; solo para desarrollo) · WhatsApp (sigue
descartado, mismo motivo de antes).

## 2026-09-12 — El repo público es la raíz entera: negocio + app, repo nuevo
**Qué:** un repo nuevo (no fork del kit) cuya raíz es este ICM: `01_negocio`, `02_producto`,
`recursos` y `/app` con el kit copiado sin su `.git`. El kit entra como archivos, no como
submódulo.
**Por qué:** al jurado le muestra cómo se decidió, no solo qué se programó — el ICM es parte del
relato. Y evita un repo anidado, que rompe `git add` desde la raíz.
**Descartado:** fork del kit (la raíz sería el kit y el negocio quedaría colgado adentro) ·
solo `/app` como repo (se pierde el registro de decisiones).

## 2026-09-12 — Voz entra: es el brief 004, después del 001
**Qué:** el cliente puede dictar el pedido en el mostrador. Es una puerta de entrada más, como
Telegram, así que tiene su propio brief (004) y se construye cuando la tarjeta del 001 existe.
Confirmar sigue siendo en el panel, nunca por voz.
**Por qué:** estaba en el pitch desde el primer día ("Voz/texto/archivo → IA interpreta") y Alen
lo confirmó. Separarlo del 001 deja el core construible ya y la voz conectable después sin
bloquear nada.
**Descartado:** voz como extra sin brief (se pierde el registro de qué se pidió) · voz adentro
del 001 (un brief, una capacidad).

## 2026-09-12 — Papel es referencia y campo opcional, no una quinta variable
**Qué:** los tipos de papel de Printos (lámina "Papeles") viven en `../recursos/catalogo.md` como
referencia, con la compatibilidad por tamaño (A2/A1/A0 solo en Normal 85 g). El agente los
registra solo si el cliente los menciona; no los pregunta. Las variables obligatorias siguen
siendo cuatro. Los datos de contacto de Printos en el repo son **de ejemplo**, no los reales.
**Por qué:** Alen mandó las láminas "para tener de referencia" y pidió no extender. Preguntar
papel en cada pedido alarga la charla y el video sin sumar al demo. Los contactos reales no van
en un repo público.
**Descartado:** papel como variable obligatoria · papel con valor por defecto (Normal 85 g):
contradice "sin defaults" y no sabemos si Printos lo trata así.

## 2026-09-12 — El pago confirma el pedido: la confirmación humana es "pago recibido"
**Qué:** un pedido tiene tres estados: `borrador` (el agente lo arma, puede tener faltantes) →
`pendiente de pago` (tarjeta completa; el cliente recibe el aviso de transferencia previa) →
`en cola` (el admin marca "pago recibido"). El botón **Confirmar** del admin es exactamente ese
paso. **Modificar** sigue igual. Los precios quedan **fuera del agente**: el monto y los datos de
transferencia los pasa una persona.
**Por qué:** es la política real de Printos — "solo con transferencia bancaria previa"
(`../recursos/printos.md`). Y hace que el human-in-the-loop no sea decorativo: la persona
confirma algo que solo ella puede ver, la transferencia.
**Descartado:** que el agente cotice (necesita lista de precios; no la tenemos y es scope) ·
dos clics separados (confirmar pedido + confirmar pago): uno alcanza para el demo.
**Reemplaza:** el alcance original del brief 001, que dejaba "pagos" totalmente afuera.

## 2026-09-12 — Catálogo base: un solo servicio (impresión), cuatro variables
**Qué:** el agente reconoce exactamente lo que está en `../recursos/catalogo.md`: **impresión**,
y lo que cambia de pedido a pedido es cantidad, tamaño final, color o ByN, y archivo adjunto.
Sin valores por defecto. Cualquier otra cosa → "fuera de catálogo" y deriva.
**Por qué:** sin lista cerrada el agente inventa. Un servicio con cuatro variables es lo que se
puede mostrar filoso en dos minutos; cada servicio extra es superficie de error.
**Descartado:** cuatro servicios (documentos, color, stickers, calcomanías) — fue la primera
propuesta, descartada por Alen antes de aprobarse: extiende demasiado. Catálogo amplio (plotter,
encuadernado), por lo mismo.

## 2026-09-12 — Printos es real: el demo usa su nombre, su tono y sus políticas
**Qué:** Printos Super Impresiones existe y tenemos su mensaje de bienvenida
(`../recursos/printos.md`). El agente se presenta como Printos, habla con su tono y aplica sus
políticas: 24 hs, orden de llegada, transferencia previa.
**Por qué:** un negocio real con reglas reales es "por qué el contexto importa" en carne y hueso.
Nada que inventar.
**Descartado:** imprenta ficticia genérica.

## 2026-09-12 — ICM Paraguas negocio+software, sin Spec Kit
**Qué:** negocio arriba (`01_negocio`, `02_producto`), software en `/app` con su propio mapa. Los
briefs cumplen el rol de la spec. No se inicializa Spec Kit.
**Por qué:** es un hackathon. El ritual SDD (specify → plan → tasks) es de semanas; el brief de una
carilla alcanza para que dos personas construyan lo mismo.
**Descartado:** ICM plano (mezcla dudas de negocio con código en el mismo contexto) · Spec Kit completo.

## 2026-09-12 — Human-in-the-loop como principio, no como feature
**Qué:** ningún pedido entra a la cola de producción sin que una persona lo confirme. El agente
propone, marca lo que falta, y para. Es regla de negocio (vive en los briefs), no detalle técnico.
**Por qué:** es la diferencia entre "un bot que toma pedidos" y "un sistema que una imprenta real
se anima a usar". Y es exactamente lo que el jurado llama "por qué el contexto importa".
**Descartado:** auto-confirmar pedidos "simples". No hay pedido simple en hora pico.

## 2026-09-12 — Estrategia de build "C+B": web garantizado, Telegram como spike con corte
**Qué:** el core (extraer pedido → tarjeta → confirmar/modificar → cola → derivar) se construye
sobre `apps/web` del kit. En paralelo, un spike intenta el canal Telegram en `apps/channel`. Hay un
momento de corte: si no llegó un mensaje de punta a punta, el canal se abandona y las dos manos
van al web. La demo mínima es web + voz.
**Por qué:** "un demo filoso que funciona le gana a un concepto amplio" (criterio del jurado). El
web template ya trae HITL, tarjetas generadas y voz. El canal es la parte con más incógnitas.
**Descartado:** empezar por el canal (si falla, no hay demo) · hacer las dos cosas en serie.

## 2026-09-12 — Canal del cliente: Telegram, no WhatsApp
**Qué:** el cliente pide por un bot de Telegram. El relato para el jurado: "hoy Telegram, mañana
WhatsApp — es el mismo SDK, cambia el import".
**Por qué:** WhatsApp exige Meta Cloud API (cuenta developer, número de prueba, verificación de
webhook) y no está documentado en el kit. Telegram es un token de BotFather. Las dos van por la
misma ruta directa de `@copilotkit/channels` (`/telegram`, `/whatsapp`).
**Descartado:** WhatsApp (muy complicado para el tiempo disponible) · Slack (es la ruta más
fácil del kit, pero ningún cliente de imprenta pide por Slack — mata el relato).

## 2026-09-12 — Modelo de OpenAI, vía OpenRouter para el chat; key de OpenAI solo para la voz
**Qué:** `MODEL_PROVIDER=openrouter` con la key de OpenRouter que Alen ya tiene, y
`MODEL=openai/<modelo>` (un modelo de OpenAI, elegido por slug, que soporte tool calling).
`OPENAI_API_KEY` se carga recién para el brief 004: la ruta `/voice` usa OpenAI Realtime
directo y no pasa por OpenRouter.
**Por qué:** la key de OpenRouter está en mano hoy; la de OpenAI no (requiere cuenta en
platform.openai.com con crédito prepago). El modelo sigue siendo de OpenAI — sponsor principal,
premios en créditos de OpenAI — y OpenRouter también es sponsor.
**Descartado:** `MODEL_PROVIDER=openai` desde el arranque (fue la primera versión de esta
decisión; bloqueaba el 001 por una key que todavía no existe) · un modelo no-OpenAI vía
OpenRouter (posible, pero pierde el relato con el sponsor).

## 2026-09-12 — Construir sobre el starter kit de CopilotKit, no desde cero
**Qué:** clonamos `CopilotKit/agents-everywhere-starter-kit` en `/app` y construimos encima.
**Por qué:** trae armados el human-in-the-loop (`useHumanInTheLoop`), tarjetas generadas en el
chat, voz, y un `agent-core` compartido entre web y canal — que es exactamente la arquitectura de
Print.ai (cliente en un canal, admin en la web, un cerebro). Además hay premio especial a mejor
uso de CopilotKit.
**Descartado:** stack propio (Next + SDK de OpenAI a pelo). Más control, cero tiempo.
