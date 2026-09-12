# 02_producto — definir qué se construye, como brief

_Última actualización: 2026-09-12_

**Un solo trabajo:** convertir una decisión de negocio en un brief que `/app` pueda construir sin
volver a preguntar. Es el único puente entre el negocio y el software.

## Entradas
- De esta corrida: la decisión que lo origina, en `../01_negocio/decisiones.md`
- De siempre (fábrica): `../_plantillas/brief.md` — el molde
- De siempre (fábrica): `../recursos/glosario.md` — los nombres de las cosas
- De siempre (fábrica): `../recursos/catalogo.md` + `../recursos/printos.md` — qué se ofrece y con qué reglas
- De siempre (fábrica): `../recursos/stack.md` — para no pedir lo que el stack no puede, ni
  reconstruir lo que Eve ya trae

## Proceso
1. Copiá `../_plantillas/brief.md` a `briefs/NNN_nombre-corto.md` (siguiente número libre).
2. Llenalo en lenguaje de negocio. **"Qué NO entra" es la sección más importante.**
3. Si queda una duda, el brief queda `estado: borrador` y la duda va también a
   `../01_negocio/dudas-abiertas.md`.
4. Sin dudas → Alen o Mauro pone `estado: aprobado` y la fecha. Recién ahí `/app` puede construirlo.
5. Cuando `/app` lo termina, `/app` cambia `estado: implementado`. El brief no se toca más salvo
   para corregir el negocio.

## Salidas
- `briefs/NNN_nombre-corto.md` → `briefs/`

## Chequeo humano
Antes de aprobar, uno de los dos lee "Qué NO entra" y "Cómo sé que está bien" y se pregunta:
**¿esto se puede mostrar en un video de 2 minutos?** Si no, se recorta hasta que sí.

## Los tres frenos (dónde una persona decide antes de seguir)
1. **Alcance cerrado** — el brief 001 está `aprobado`. Antes de eso, en `/app` solo se lee el kit
   y se levanta el entorno; no se escribe producto.
2. **Corte del canal** — el canal de Telegram (brief 002) tiene un momento de corte que se fija al
   arrancarlo. Si al llegar no pasó un mensaje de punta a punta (celular → agente → tarjeta en el
   panel), el brief pasa a `descartado`, se registra en `../01_negocio/decisiones.md`, y las dos
   manos van al web. Sin negociar.
3. **Freeze** — se deja de construir. Lo que hay es lo que se graba. De ahí en adelante solo
   `../recursos/evento.md`: video, descripción, post, repo limpio.

## Qué es buen trabajo
Un brief que Mauro puede tomar sin haber estado en la conversación y saber exactamente qué
construir y qué dejar afuera.

## Qué evitar
- Briefs con "y también…": un brief, una capacidad. Si crece, partilo.
- Poner detalles técnicos (componentes, endpoints, nombres de archivo). Eso lo decide `/app`.
- Aprobar con dudas abiertas.
