import { z } from "zod";
import { ARCHIVOS, COLORES, ENTREGAS, PAPELES, TAMANOS } from "./pedidos";

// Every field is optional: pass only what the client actually said.
// Brief 001: a missing value is shown as missing, never invented.
export const camposPedidoSchema = z.object({
  cantidad: z.number().int().positive().optional().describe("Number of copies."),
  tamano: z.enum(TAMANOS).optional().describe("Final print size."),
  color: z.enum(COLORES).optional().describe('"color", or "byn" for black and white.'),
  archivo: z
    .enum(ARCHIVOS)
    .optional()
    .describe("Type of the file the client sent or says they are sending."),
  papel: z
    .enum(PAPELES)
    .optional()
    .describe("Paper, only if the client mentioned it. Never ask for it."),
  entrega: z
    .enum(ENTREGAS)
    .optional()
    .describe('"retiro" for pickup at the shop, or "delivery".'),
  fecha: z.iso
    .date()
    .optional()
    .describe("Day the client needs it, YYYY-MM-DD, resolved against the current date."),
  hora: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .describe("Time the client needs it, HH:MM in 24h. Only if they gave a time."),
});
