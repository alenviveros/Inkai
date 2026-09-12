---
estado: implementado
aprobado: 2026-09-12
implementado: 2026-09-12
feature:
---

# Brief 005 — Avisar al cliente que su pedido está terminado

## El problema
Cuando el trabajo sale de la impresora, el cliente no se entera hasta que llama o pasa por el
local. Y al retirar, el mostrador tiene que buscar el pedido sin un dato claro.

## Para quién
El admin de Printos, cuando termina un pedido de la cola. Y el cliente que pidió por Telegram, que
espera saber cuándo pasar.

## Qué tiene que poder hacer
- El admin marca como **terminado** un pedido de la cola de producción, desde el panel.
- El pedido pasa a la columna de terminados.
- Si el pedido entró por Telegram, el cliente recibe en ese chat un aviso de que está listo, con su
  número de pedido para retirarlo.

## Qué NO entra (alcance)
- Marcar el pedido como entregado o retirado. Terminado es el último estado del demo.
- Avisos por otro canal: correo, SMS o WhatsApp.
- Que el cliente responda el aviso y el agente lo entienda en contexto.
- Cobrar o verificar algo al retirar: el pago ya se confirmó antes de la cola.

## Reglas de negocio que aplican
- Solo un pedido **en cola** pasa a **terminado**. No se saltea ningún estado.
- El aviso sale una sola vez: cuando el pedido pasa a terminado.
- El número del aviso es el mismo de la tarjeta.
- Retiro: el cliente lo retira en el local diciendo su número de pedido. Delivery: se le avisa que
  está listo, sin prometer horario (`../../recursos/printos.md`).
- El aviso habla como Printos (`../../recursos/printos.md`, "Cómo habla").

## Cómo sé que está bien
En el video: el admin aprieta "Marcar terminado" en un pedido de la cola → el celular del cliente
recibe "Su pedido #4 ya está listo…" con el número → el pedido aparece en Terminados.

## Dudas abiertas
_(ninguna)_
