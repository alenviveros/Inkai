---
estado: implementado
aprobado: 2026-09-12
implementado: 2026-09-12
feature:
---

# Brief 001 — Pedido desde una conversación

## El problema
El admin de Printos transcribe a mano cada charla (mostrador, chat, correo) a una orden de
trabajo, y además controla a mano si el pago llegó antes de producir. En hora pico se atrasa, se
mezcla o se pierde.

## Para quién
El admin / mostrador de Printos, en el momento en que llega un pedido nuevo.

## Qué tiene que poder hacer
- Recibir un pedido en lenguaje natural (texto) y producir una **tarjeta de pedido** con: número,
  cantidad, tamaño final, color o ByN, archivo (¿llegó? ¿qué es?), entrega (retiro o delivery),
  fecha y hora — y papel solo si el cliente lo dijo.
- Marcar explícitamente lo que falta ("⚠️ Falta: tamaño"). Nunca inventar un dato.
- Si el cliente pide algo que no es imprimir un archivo → marcarlo "fuera de catálogo" (la
  derivación es el brief 003).
- Ofrecer **Modificar**: la persona corrige en lenguaje natural y la tarjeta se actualiza.
- Cuando la tarjeta está completa, el pedido queda **pendiente de pago** y el cliente recibe el
  aviso de que se trabaja con transferencia previa. El monto lo pasa una persona, no el agente.
- El admin aprieta **Confirmar** = "pago recibido" → el pedido entra a la **cola de producción**,
  una lista visible en el panel admin, por orden de llegada.

## Qué NO entra (alcance)
- Cotizar. El agente no dice precios; el monto y los datos de transferencia los pasa el admin.
- Verificar el pago de verdad (leer un comprobante, consultar un banco). Confirmar es un clic humano.
- Procesar el archivo real (abrirlo, validar resolución). Solo se registra si llegó y qué es.
- Más de una imprenta · multiusuario · login.
- Persistencia real: la cola puede vivir en memoria o en un archivo local. Es un demo.
- El cliente pidiendo desde Telegram → brief 002. Derivar a una persona → brief 003.

## Reglas de negocio que aplican
- Ningún pedido entra a la cola sin que una persona confirme el pago. Es política de Printos:
  `../../recursos/printos.md`.
- Estados del pedido: `borrador` → `pendiente de pago` → `en cola`. No se saltea ninguno.
- Un campo obligatorio que falta se muestra como faltante. **Sin valores por defecto**
  (`../../recursos/catalogo.md`).
- Solo se reconocen el servicio y los valores de `../../recursos/catalogo.md`.
- El número de pedido es correlativo y no se reutiliza.
- La cola se ordena por llegada (política de Printos).
- El agente habla como Printos (`../../recursos/printos.md`, "Cómo habla").

## Cómo sé que está bien
En el video: alguien escribe "quiero 50 copias de este PDF para mañana" → aparece la tarjeta con
⚠️ Falta: tamaño · color · entrega → la persona responde "A4, a color, paso a retirar" → tarjeta
completa, pendiente de pago → el admin aprieta Confirmar → el pedido aparece en la cola. Menos
de 60 segundos.

## Dudas abiertas
_(ninguna — la voz es el brief 004)_
