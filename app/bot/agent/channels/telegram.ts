import { telegramChannel } from "eve/channels/telegram";
import { guardarChatTelegram } from "../lib/pedidos";
import { pedidoActual } from "../lib/sesion";

// Brief 002: clients order from Telegram. Credentials come from .env.local:
// TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET_TOKEN. The webhook is registered with
// scripts/telegram-webhook.mjs.
// Photos and PDFs up to 20 MB, Telegram's limit for bot downloads, land in the agent workspace;
// the order tools upload them to Supabase Storage (agent/lib/adjuntos.ts).
export default telegramChannel({
  uploadPolicy: {
    // eve checks this list twice: first against the type Telegram declares for the photo or
    // document, then against the download response, which Telegram always serves as
    // application/octet-stream. Without that entry every download is rejected. The first check
    // still keeps other document types out, and the tools recognize a PDF or image by its bytes.
    allowedMediaTypes: ["image/*", "application/pdf", "application/octet-stream"],
    maxBytes: 20 * 1024 * 1024,
  },
  events: {
    // Brief 005: after each turn, remember this chat on the conversation's order, so the panel can
    // tell the client when it is ready. turn.completed has no built-in handler, so none is replaced.
    async "turn.completed"(_data, channel) {
      try {
        const { id } = pedidoActual.get();
        if (id !== null) await guardarChatTelegram(id, channel.telegram.chatId);
      } catch (error) {
        console.error("telegram: could not save the chat on the order", error);
      }
    },
  },
});
