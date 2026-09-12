# 01_negocio — pensar el porqué y registrar decisiones

_Última actualización: 2026-09-12_

**Un solo trabajo:** dejar por escrito qué problema resolvemos, para quién, y qué decidimos y por
qué. Acá no se define alcance de software (eso es /02_producto) ni se programa (/app).

## Entradas
- De esta corrida: lo que Alen o Mauro traigan al chat — una idea, un cambio, una duda
- De siempre (fábrica): `../recursos/evento.md` — qué se entrega y qué mira el jurado
- De siempre (fábrica): `../recursos/glosario.md` — los nombres de las cosas, para no inventar
- De siempre (fábrica): `../recursos/printos.md` — lo que sabemos del cliente real, de primera mano
- Estado actual (esta carpeta): `problema-y-cliente.md` · `decisiones.md` · `dudas-abiertas.md`

## Proceso
1. Leé `decisiones.md` antes de opinar: puede que ya esté decidido.
2. Cambio de idea → editá `problema-y-cliente.md` en el lugar.
3. Decisión → nueva entrada arriba de todo en `decisiones.md`: fecha, qué, por qué, qué se descartó.
4. No se puede decidir todavía → `dudas-abiertas.md`. Cuando se resuelve, la duda se borra de ahí
   y nace la decisión. Nunca quedan las dos.
5. Si la decisión cambia qué se construye → avisá que hay que tocar o crear un brief en
   `/02_producto`. No lo escribas desde acá.

## Salidas
- `problema-y-cliente.md`, `decisiones.md`, `dudas-abiertas.md` → esta carpeta, editados en el lugar

## Chequeo humano
Alen o Mauro lee la entrada nueva de `decisiones.md` en voz alta y verifica que el "por qué" se
entienda **sin el chat que la originó**. Si necesita el chat para entenderse, se reescribe.

## Qué es buen trabajo
Alguien que llega el lunes sin haber estado hoy entiende qué se decidió y por qué en cinco minutos.

## Qué evitar
- Discutir stack acá. Está decidido en `../recursos/stack.md`. Si hay que cambiarlo, primero es
  una decisión (entrada en `decisiones.md`) y después se actualiza `../recursos/stack.md`.
- Escribir cómo se implementa. Eso baja como brief y se resuelve en /app.
- Dejar una duda ya resuelta en `dudas-abiertas.md`.
