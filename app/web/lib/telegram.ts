// Brief 005: tells a Telegram client that their order is ready.
// Server-only: imported from app/actions.ts. The panel talks to Telegram's API directly, not to the
// bot, so the notice does not depend on the bot being reachable. Needs TELEGRAM_BOT_TOKEN, the same
// token the bot uses, in app/web/.env.local.
import type { Pedido } from "@/lib/pedidos";

/** The notice, in Printos' voice (recursos/printos.md, "Cómo habla"). */
export function textoAviso(pedido: Pick<Pedido, "id" | "entrega">): string {
  const cuerpo =
    pedido.entrega === "delivery"
      ? `Su pedido #${pedido.id} ya está listo y saldrá por delivery.`
      : `Su pedido #${pedido.id} ya está listo. Para retirarlo, indique en el local su número de pedido: ${pedido.id}.`;
  return `Hola, le escribe Printos Super Impresiones. ${cuerpo}\n\n¡Estamos abiertos las 24hs!`;
}

/** Sends the notice. Returns null when Telegram accepted it, or the reason it failed. */
export async function avisarPorTelegram(pedido: Pedido): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return "falta TELEGRAM_BOT_TOKEN en app/web/.env.local.";
  if (pedido.telegram_chat_id === null) return "el pedido no tiene chat de Telegram.";

  try {
    const respuesta = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: pedido.telegram_chat_id, text: textoAviso(pedido) }),
    });
    const cuerpo = (await respuesta.json()) as { ok?: boolean; description?: string };
    return cuerpo.ok ? null : (cuerpo.description ?? `Telegram respondió HTTP ${respuesta.status}.`);
  } catch {
    // Never surface the raw error: the request URL carries the bot token.
    return "no se pudo conectar con Telegram.";
  }
}
