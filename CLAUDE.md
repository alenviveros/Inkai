# Inkai — hackathon "Agents, Everywhere" (AI Tinkerers Asunción)

Somos Alen Martínez y Mauro Vera, equipo de 2. Construimos **Inkai**: un agente que convierte
conversaciones desordenadas (texto, voz, archivos) en órdenes de trabajo listas para producir, para
imprentas con mucho movimiento. La IA propone; una persona confirma.
Objetivo: entregar un demo filoso que funciona. Un demo que anda le gana a un concepto amplio.

Este es el ICM **padre**: el negocio. El software vive en `/app` y tiene su propio mapa.

## Estructura
- README.md — el pitch para el jurado, en inglés. Los textos del formulario: `recursos/entrega.md`
- /01_negocio — el PORQUÉ: problema, cliente, decisiones tomadas, dudas abiertas
- /02_producto — el QUÉ: briefs de lo que se construye (el único artefacto que baja a /app)
- /recursos — la fábrica: evento, stack fijo, glosario, catálogo, Printos (el cliente real)
- /_plantillas — molde en blanco del brief
- /app — el software: `app/web` (dashboard Next.js) y `app/bot` (agente Eve para Telegram),
  unidos solo por Supabase (`app/supabase`: la migración de `pedidos`). Su mapa: `app/CLAUDE.md`

## Routing
| Tarea | Andá a | Leé |
|---|---|---|
| Pensar o cambiar la idea, el cliente, el pitch | /01_negocio | CONTEXT.md |
| Tomar o revisar una decisión | /01_negocio | CONTEXT.md + decisiones.md |
| Definir qué se construye (brief nuevo o cambio) | /02_producto | CONTEXT.md + _plantillas/brief.md |
| Construir, debuggear, correr la app | /app | app/CLAUDE.md + solo el brief que aplica |
| Preparar la entrega (video, descripción, post, repo) | /recursos | evento.md |
| Qué ofrece Printos, cómo habla, sus políticas | /recursos | catalogo.md + printos.md |
| Saber en qué anda todo | /02_producto/briefs | `grep -H "^estado:" 02_producto/briefs/*.md` — sin abrir nada |
| Retomar en una sesión nueva | /01_negocio | dudas-abiertas.md + el estado de los briefs; después `app/CLAUDE.md` → "Arranque" |

## Las 4 reglas del límite negocio ↔ app
1. Arriba: por qué y para quién. Abajo: cómo se construye. Si algo cambia porque cambiaste de
   idea → arriba. Si cambia porque descubriste algo construyendo → abajo.
2. Nada baja como charla: baja como brief en `02_producto/briefs/` con `estado: aprobado`.
   Sin brief no hay código.
3. Un hogar por hecho. Las reglas de negocio viven en el brief; `/app` apunta, no copia.
4. Este mapa no describe las tripas de `/app`. Apunta y se calla.

## Convenciones
- Briefs: `NNN_nombre-corto.md` (001, 002…). El `estado` va en el frontmatter.
- Decisiones: una entrada por decisión en `01_negocio/decisiones.md`, con fecha y por qué.
- Idioma: español con voseo. Código, commits y README del repo en inglés (el jurado es global).

## Reglas
- Una cosa por pedido. Trabajo grande → pasos, y revisamos entre paso y paso.
- Tres frenos donde una persona decide antes de seguir: **alcance cerrado** (brief 001 aprobado),
  **corte del canal** Telegram, y **freeze** para grabar. Están en `02_producto/CONTEXT.md`.
- No inventes APIs: las skills técnicas (`ai-sdk`, `eve`) están en `.claude/skills/`, y los docs
  de Eve viajan en su paquete. Leé antes de escribir.
- Los CONTEXT.md son vivos. Checklist de cierre: si se creó o movió algo, el mismo cambio
  actualiza este mapa y el CONTEXT.md de la sala afectada. Nada existe hasta que está documentado.
