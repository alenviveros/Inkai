# Glosario — los nombres de las cosas

Un nombre por cosa. Si aparece un término nuevo, entra acá antes que en un brief.

## De la imprenta
- **Pedido** — lo que el cliente quiere, tal como lo pide. Desordenado.
- **Orden de trabajo** — el pedido ya estructurado y confirmado, listo para producir.
- **Cola de producción** — la lista de órdenes confirmadas, en orden.
- **Servicio** — uno solo: impresión. Lo que varía por pedido está en `catalogo.md`: cantidad, tamaño, color, archivo.
- **Tamaño** — Carta, A4, Oficio, A3, A3+ · grandes: A2, A1, A0. · **Cantidad** — cuántas copias.
- **Papel** — opcional: se registra si el cliente lo pide, no se pregunta. Tipos y compatibilidad por tamaño: `catalogo.md`.
- **Archivo** — lo que se imprime: PDF, imagen u otro imprimible. En el demo solo se registra si llegó y qué es.
- **Entrega** — la modalidad (**retiro** en el local o **delivery**) y la fecha-hora en que lo necesita.

## De Inkai
- **Tarjeta de pedido** — la vista estructurada que el agente propone: `Pedido #104 · 50 × A5 …`.
- **Faltante** — un campo que el agente no pudo determinar. Se marca con ⚠️, nunca se inventa.
- **Pendiente de pago** — tarjeta completa, esperando la transferencia. Todavía no está en la cola.
- **Confirmar** — el admin marca "pago recibido"; el pedido pasa de pendiente de pago a en cola.
- **En cola** — pago confirmado; entra a producción por orden de llegada.
- **Terminado** — el pedido salió de producción. Si entró por Telegram, el cliente recibe un aviso
  con su número de pedido para retirarlo (brief 005).
- **Fuera de catálogo** — el cliente pidió algo que no está en `catalogo.md`. No se inventa: se deriva.
- **Modificar** — la persona corrige en lenguaje natural; la tarjeta se actualiza.
- **Derivar** — el agente pasa la conversación a una persona, con la tarjeta parcial y el motivo.
- **Panel admin** — la web donde vive la cola, las tarjetas y las derivaciones.
- **Mostrador** — la entrada presencial. En el demo: voz (`/voice`).

## Del stack
- **Webhook** — Telegram le manda cada mensaje del cliente a una URL nuestra (una ruta de la app
  en Vercel). No hace falta un proceso escuchando ni un túnel.
- **Tool calling** — el modelo no responde solo texto: llama funciones nuestras (crear pedido,
  marcar faltante, derivar) con datos tipados. Es cómo la charla se vuelve tarjeta.
- **Eve** — el framework del bot. Un agente es una carpeta: las instrucciones, `tools/`,
  `channels/`. Sus docs viajan en el paquete (`app/bot/node_modules/eve/docs/`).
- **Sesión durable** — la conversación de un cliente en Telegram, que Eve guarda entre mensajes
  y entre deploys. Por eso el agente se acuerda de lo que faltaba.
- **Supabase Realtime** — el dashboard se entera de un pedido nuevo sin recargar: la base avisa.
- **App Router / RSC** — la forma de Next.js 15 de armar páginas; el dashboard vive ahí.
- **HITL (human-in-the-loop)** — el agente para y espera aprobación humana antes de actuar. Acá:
  Confirmar en el dashboard.

## Del método (ICM)
- **Brief** — una carilla en lenguaje de negocio que dice qué construir y qué no. Sin brief no hay código.
- **Decisión** — una entrada fechada con qué, por qué y qué se descartó.
- **Freno** — un punto donde una persona decide antes de seguir. Hay tres.
