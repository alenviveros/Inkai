---
estado: borrador
aprobado:
feature:
---

# Brief 003 — Derivar la conversación a una persona

## El problema
Hay pedidos que el agente no puede cerrar: una ambigüedad que no se destraba, algo fuera de
catálogo, o un cliente que quiere hablar con alguien. Si el agente insiste, el cliente se frustra
y el pedido se pierde igual.

## Para quién
El admin, que tiene que enterarse de que hay una charla que necesita una persona — con el
contexto ya armado, no desde cero.

## Qué tiene que poder hacer
- El agente detecta que no puede resolver (o el cliente lo pide) y marca la conversación como
  **derivada**.
- En el panel admin aparece la conversación derivada con lo que ya se entendió (tarjeta parcial)
  y el motivo.
- El admin la toma y sigue la charla.

## Qué NO entra (alcance)
- Que el admin responda desde el panel hacia Telegram (ida y vuelta). Con que la vea y la tome
  alcanza para el demo.

## Reglas de negocio que aplican
- Derivar nunca borra lo ya capturado: la tarjeta parcial viaja con la derivación.
- El agente deriva; no decide por el cliente ni cierra el pedido solo.

## Cómo sé que está bien
En el video: un pedido raro → el agente dice que lo pasa a una persona → aparece en el panel con
el motivo.

## Dudas abiertas
- ¿Entra en el demo, o es lo primero que se recorta en el freeze?
