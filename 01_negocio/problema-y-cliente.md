# Print.ai — problema, cliente, solución

## Pitch en una frase
**Print.ai convierte conversaciones desordenadas en trabajos de impresión listos para producir.**

## El problema
En imprentas con mucho movimiento — Printos Super Impresiones es el caso real, ver
`../recursos/printos.md` — los pedidos llegan por mostrador, WhatsApp o correo. Cada uno mezcla mensajes, archivos e instrucciones distintas. En hora pico se acumulan,
tardan en responderse, se mezclan o se pierden.

## Para quién
- **El que recibe pedidos** (admin / mostrador): hoy transcribe a mano cada charla a una orden de
  trabajo. En hora pico es el cuello de botella.
- **El cliente que pide**: hoy espera una respuesta y no sabe si su pedido quedó bien tomado.

## La solución
Un agente que toma una conversación natural (texto, voz, archivo) y la convierte en una orden de
trabajo estructurada.

> Cliente: "Quiero 50 de este diseño en A5, a color, para las 18."
>
> Print.ai genera:
> ```
> Pedido #104
> 50 × impresión · Color · Archivo ✓ (PDF) · Entrega: 18:00
> ⚠️ Falta: tamaño
> [Confirmar] [Modificar]
> ```

## Flujo
Voz/texto/archivo → la IA interpreta → saca las cuatro variables (cantidad, tamaño, color,
archivo) → genera o actualiza el pedido → queda **pendiente de pago** → **una persona confirma el pago** → el pedido entra a
la cola de producción, por orden de llegada.

## Principio no negociable: human-in-the-loop
La IA organiza y propone. Una persona confirma antes de que algo se ejecute. Lo que falta se marca
como faltante; **nunca se inventa**.
_(La decisión y su porqué: `decisiones.md`. Como regla operativa vive en cada brief, no acá.)_

## Derivación a humano
Cuando el agente no puede resolver el pedido — ambigüedad que no se destraba, algo fuera de
catálogo, un cliente que quiere hablar con alguien — deriva la conversación a una persona del
lado admin, con el contexto ya armado. (Brief 003.)

## Por qué el contexto importa
_(Esto es literal uno de los entregables: "descripción de qué construiste y por qué el contexto importa".)_

El agente no vive en un chat genérico: vive **donde ya pasa el trabajo** de la imprenta — en el
canal por el que el cliente ya pide (Telegram hoy, WhatsApp mañana) y en el panel donde el admin
ya decide. El valor no es "chatear con una IA": es que la charla desordenada termine como una
orden en la cola sin que nadie la transcriba, y que el humano siga siendo quien aprieta el botón.

## Dónde vive (superficies)
- **Cliente:** Telegram (ver `decisiones.md`) · voz en el mostrador (ruta `/voice` del kit)
- **Admin:** panel web con la cola de pedidos, confirmar/modificar, y las derivaciones
