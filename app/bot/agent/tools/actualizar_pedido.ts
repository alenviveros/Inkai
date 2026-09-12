import { defineTool } from "eve/tools";
import { marcarAdjuntosUsados, tomarAdjuntoNuevo } from "../lib/adjuntos";
import { camposPedidoSchema } from "../lib/campos";
import { actualizarPedido, obtenerPedido, paraModelo } from "../lib/pedidos";
import { pedidoActual } from "../lib/sesion";

export default defineTool({
  description:
    "Update this conversation's order card when the client gives a missing value, corrects one, " +
    "or sends a photo or PDF in the chat. Pass only the fields that changed; with a new file, " +
    "call it even with no fields. Returns the updated card to show the client.",
  inputSchema: camposPedidoSchema,
  label: { start: () => "Actualizando la tarjeta del pedido" },
  async execute(campos, ctx) {
    const { id } = pedidoActual.get();
    if (id === null) {
      throw new Error("There is no order in this conversation yet. Use crear_pedido first.");
    }
    if (!(await obtenerPedido(id))) {
      // The order was deleted, for example to reset the demo: forget it and start a new one.
      pedidoActual.update(() => ({ id: null }));
      throw new Error(
        "This conversation's previous order no longer exists. Call crear_pedido to start a new order with what the client said.",
      );
    }
    const adjunto = await tomarAdjuntoNuevo(ctx);
    const resultado = await actualizarPedido(id, {
      ...campos,
      ...(adjunto ? { archivo: adjunto.archivo, archivo_path: adjunto.archivo_path } : {}),
    });
    if (adjunto) marcarAdjuntosUsados(adjunto.vistos);
    return resultado;
  },
  toModelOutput: (resultado) => ({ type: "text", value: paraModelo(resultado) }),
});
