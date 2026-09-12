import { defineTool } from "eve/tools";
import { marcarAdjuntosUsados, tomarAdjuntoNuevo } from "../lib/adjuntos";
import { camposPedidoSchema } from "../lib/campos";
import { crearPedido, obtenerPedido, paraModelo } from "../lib/pedidos";
import { pedidoActual } from "../lib/sesion";

export default defineTool({
  description:
    "Create the print order card for this conversation as soon as the client asks to print a file, " +
    "even if most fields are still missing. Pass only the values the client actually said. " +
    "A photo or PDF the client sent in the chat attaches by itself. Returns the card to show the client.",
  inputSchema: camposPedidoSchema,
  label: { start: () => "Armando la tarjeta del pedido" },
  async execute(campos, ctx) {
    const { id } = pedidoActual.get();
    if (id !== null) {
      const anterior = await obtenerPedido(id);
      if (anterior?.estado === "borrador") {
        throw new Error(
          `Order #${id} is still a draft in this conversation. Use actualizar_pedido to complete or correct it.`,
        );
      }
    }
    const adjunto = await tomarAdjuntoNuevo(ctx);
    const resultado = await crearPedido({
      ...campos,
      ...(adjunto ? { archivo: adjunto.archivo, archivo_path: adjunto.archivo_path } : {}),
    });
    pedidoActual.update(() => ({ id: resultado.pedido.id }));
    if (adjunto) marcarAdjuntosUsados(adjunto.vistos);
    return resultado;
  },
  toModelOutput: (resultado) => ({ type: "text", value: paraModelo(resultado) }),
});
