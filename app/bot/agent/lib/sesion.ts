import { defineState } from "eve/context";

// The order this conversation is building. Durable: survives turns, restarts and redeploys.
// The tools read it instead of trusting an order id from the model, so a conversation
// can only change its own order.
export const pedidoActual = defineState(
  "inkai.pedido-actual",
  (): { id: number | null } => ({ id: null }),
);
