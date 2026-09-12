---
estado: implementado
aprobado: 2026-09-12
implementado: 2026-09-12
feature:
---

# Brief 002 — El cliente pide por Telegram

_Puerta de entrada principal del cliente (decisión en `../../01_negocio/decisiones.md`). El freno 2
de `../CONTEXT.md` sigue como red: si no llega un mensaje de punta a punta, se corta._

## El problema
El cliente ya pide por chat desde el celular. Obligarlo a entrar a una web es agregar fricción
donde había cero. Y el archivo a imprimir lo manda por el mismo chat: si el admin no lo ve junto
al pedido, tiene que ir a buscarlo a otro lado.

## Para quién
El cliente de la imprenta, desde su celular, como le escribiría al mostrador. Y el admin, que
recibe ese pedido con su archivo en el panel.

## Qué tiene que poder hacer
- El cliente escribe al bot de Telegram en lenguaje natural.
- El agente responde con la tarjeta de pedido en texto y pregunta lo que falta.
- El cliente puede mandar por el chat el archivo a imprimir: una foto o un PDF.
- El pedido aparece en la cola del panel admin igual que en el brief 001, y el archivo que mandó
  el cliente se abre desde su tarjeta.

## Qué NO entra (alcance)
- Confirmación final desde Telegram: la confirma el admin en el panel. El cliente solo aporta datos.
- Procesar el archivo: no se revisa resolución, páginas ni contenido. Se guarda y se muestra.
- Archivos que no sean foto o PDF, o de más de 20 MB, que es el límite de Telegram para bots.
- Más de un archivo por pedido: vale el último que mandó el cliente.
- WhatsApp.

## Reglas de negocio que aplican
- Las del brief 001.
- Un archivo recibido cubre el campo "archivo" del pedido, con su tipo: foto o PDF.
- Sin login: quien tiene el panel ve los archivos (decisión en `../../01_negocio/decisiones.md`).

## Cómo sé que está bien
En el video, desde un celular real: el cliente escribe el pedido y manda un PDF por Telegram → el
pedido aparece en la cola del panel → el admin abre el PDF desde la tarjeta.

## Dudas abiertas
_(ninguna. Lo construye Claude con Alen. El corte del freno 2 es el primer mensaje real desde un
celular que llegue al panel: si no pasa, Telegram se descarta.)_
