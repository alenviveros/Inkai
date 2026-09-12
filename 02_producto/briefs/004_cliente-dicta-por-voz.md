---
estado: borrador
aprobado:
feature:
---

# Brief 004 — El cliente dicta el pedido en el mostrador (voz)

_Otra puerta de entrada, como el brief 002. Se construye **después** del 001: sin tarjeta no hay
a dónde llevar lo dictado._

## El problema
En el mostrador el cliente habla, no tipea. Pedirle que escriba en una pantalla es meter un paso
que hoy no existe.

## Para quién
El cliente presente en el local, y el admin que hoy escucha y transcribe.

## Qué tiene que poder hacer
- El cliente dicta el pedido en voz alta ("quiero 50 copias de este PDF en A4 a color").
- El agente lo entiende y responde hablando: repite lo que entendió y pregunta lo que falta.
- Lo dictado termina como **tarjeta de pedido** igual que si hubiera entrado por texto
  (brief 001): mismas variables, mismos faltantes, mismo camino a pendiente de pago.

## Qué NO entra (alcance)
- Confirmar por voz. El admin confirma en el panel, con el pago a la vista.
- Reconocer al cliente por la voz, ni recordarlo entre visitas.
- Ruido de local real, varios hablando a la vez. Es un demo: una persona, un micrófono.

## Reglas de negocio que aplican
- Las del brief 001. Este brief no agrega reglas: agrega una puerta de entrada.
- Si conectar la voz con la tarjeta no sale, vale la versión degradada: la voz se transcribe y
  la transcripción entra al chat como texto. Se registra en `../../01_negocio/decisiones.md`.

## Cómo sé que está bien
En el video: alguien dicta el pedido → el agente repite y pregunta un faltante en voz alta → la
persona responde hablando → la tarjeta aparece en el panel. Es la escena de apertura si sale; si
no, el video arranca por texto.

## Dudas abiertas
- Se aprobó cuando la voz venía gratis con el kit. Sin kit, ¿con qué se hace? Web Speech API
  (gratis, solo navegador) u OpenAI Realtime (key + saldo). Ver `../../01_negocio/dudas-abiertas.md`.
