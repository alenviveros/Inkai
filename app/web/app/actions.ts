"use server";

import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  ARCHIVOS,
  CAMPO_LABEL,
  COLORES,
  EDITABLES,
  ENTREGAS,
  PAPELES,
  TAMANOS,
  estadoPara,
  papelIncompatible,
  type CamposEditables,
  type Pedido,
} from "@/lib/pedidos";
import { supabase } from "@/lib/supabase";
import { avisarPorTelegram } from "@/lib/telegram";

export type ResultadoAccion =
  | { ok: true; pedido: Pedido; mensaje: string; advertencia?: string }
  | { ok: false; error: string };

const MAX_INSTRUCCION = 500;

/** Confirmar = "pago recibido" (brief 001). Only a pending-payment order can enter the queue. */
export async function confirmarPago(id: number): Promise<ResultadoAccion> {
  if (!Number.isInteger(id)) return { ok: false, error: "Pedido inválido." };

  const { data, error } = await supabase()
    .from("pedidos")
    .update({ estado: "en_cola" })
    .eq("id", id)
    .eq("estado", "pendiente_pago") // no state is skipped
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: `No se pudo confirmar el pago: ${error.message}` };
  if (!data) return { ok: false, error: `El pedido #${id} ya no está pendiente de pago.` };

  return {
    ok: true,
    pedido: data as Pedido,
    mensaje: `Pago confirmado: el pedido #${id} entró a la cola de producción.`,
  };
}

// null = "the admin did not change this field". No numeric or pattern constraints here, so the
// provider's structured-output mode accepts the schema; values are validated in `validar`.
const cambiosSchema = z.object({
  cantidad: z.number().nullable().describe("New number of copies."),
  tamano: z.enum(TAMANOS).nullable().describe("New final print size."),
  color: z.enum(COLORES).nullable().describe('"color", or "byn" for black and white.'),
  archivo: z.enum(ARCHIVOS).nullable().describe("New file type."),
  papel: z.enum(PAPELES).nullable().describe("New paper."),
  entrega: z
    .enum(ENTREGAS)
    .nullable()
    .describe('"retiro" for pickup at the shop, or "delivery".'),
  fecha: z.string().nullable().describe("Day the client needs it, as YYYY-MM-DD."),
  hora: z.string().nullable().describe("Time the client needs it, as HH:MM in 24h."),
  noAplicado: z
    .string()
    .nullable()
    .describe(
      "In Spanish: the part of the correction these fields cannot express or that is outside the allowed values. Null when everything was applied.",
    ),
});

type Cambios = z.infer<typeof cambiosSchema>;

const SISTEMA = `You turn a print shop admin's correction, written in Spanish, into field changes for one print order.
Return a value only for the fields the admin explicitly changes or adds. Return null for every other field. Never guess, and never fill a field the admin did not mention.
Resolve relative days ("mañana", "el viernes") against today's date in Asunción, given in the prompt.
If the admin asks for something these fields cannot express, or a value that is not allowed, explain it briefly in Spanish in noAplicado.`;

function hoyEnAsuncion(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function validar(v: Omit<Cambios, "noAplicado">): string | null {
  if (v.cantidad !== null && (!Number.isInteger(v.cantidad) || v.cantidad < 1)) {
    return "La cantidad tiene que ser un número entero desde 1.";
  }
  if (v.fecha !== null && !/^\d{4}-\d{2}-\d{2}$/.test(v.fecha)) return "No entendí la fecha.";
  if (v.hora !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.hora)) return "No entendí la hora.";
  return null;
}

/** Modificar (brief 001): the admin corrects the card in natural language. */
export async function modificarPedido(id: number, instruccion: string): Promise<ResultadoAccion> {
  const texto = instruccion.trim().slice(0, MAX_INSTRUCCION);
  if (!Number.isInteger(id)) return { ok: false, error: "Pedido inválido." };
  if (!texto) return { ok: false, error: "Escribí qué hay que cambiar." };
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "Falta ANTHROPIC_API_KEY en app/web/.env.local." };
  }

  const db = supabase();
  const lectura = await db.from("pedidos").select().eq("id", id).maybeSingle();
  if (lectura.error) return { ok: false, error: `No se pudo leer el pedido: ${lectura.error.message}` };
  const actual = lectura.data as Pedido | null;
  if (!actual) return { ok: false, error: `El pedido #${id} no existe.` };
  if (!EDITABLES.includes(actual.estado)) {
    const donde =
      actual.estado === "en_cola"
        ? "en la cola de producción"
        : actual.estado === "terminado"
          ? "terminado"
          : "derivado";
    return { ok: false, error: `El pedido #${id} ya está ${donde} y no se modifica desde acá.` };
  }

  const campos: CamposEditables = {
    cantidad: actual.cantidad,
    tamano: actual.tamano,
    color: actual.color,
    archivo: actual.archivo,
    papel: actual.papel,
    entrega: actual.entrega,
    fecha: actual.fecha,
    hora: actual.hora?.slice(0, 5) ?? null,
  };

  let cambios: Cambios;
  try {
    const { output } = await generateText({
      model: anthropic("claude-sonnet-5"),
      output: Output.object({ schema: cambiosSchema }),
      system: SISTEMA,
      prompt: [
        `Today in Asunción: ${hoyEnAsuncion()}.`,
        `Current order (JSON): ${JSON.stringify(campos)}`,
        `Admin correction: ${JSON.stringify(texto)}`,
      ].join("\n"),
    });
    cambios = output;
  } catch (error) {
    console.error("modificarPedido: model call failed", error);
    return { ok: false, error: "No pude interpretar la corrección. Probá con otras palabras." };
  }

  const { noAplicado, ...valores } = cambios;
  const invalido = validar(valores);
  if (invalido) return { ok: false, error: invalido };

  // Keep only real changes, so the confirmation says exactly what moved.
  const anteriores = campos as Record<string, unknown>;
  const diferencias = Object.fromEntries(
    Object.entries(valores).filter(([campo, valor]) => valor !== null && valor !== anteriores[campo]),
  ) as Partial<CamposEditables>;
  const cambiados = Object.keys(diferencias) as Array<keyof CamposEditables>;
  if (cambiados.length === 0) {
    return { ok: false, error: noAplicado ?? "No encontré ningún cambio para aplicar." };
  }

  const final = { ...actual, ...diferencias };
  const incompatible = papelIncompatible(final.tamano, final.papel);
  if (incompatible) return { ok: false, error: incompatible };

  const { data, error } = await db
    .from("pedidos")
    .update({ ...diferencias, estado: estadoPara(final) })
    .eq("id", id)
    .in("estado", [...EDITABLES]) // the bot or another admin may have moved it meanwhile
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: `No se pudo guardar: ${error.message}` };
  if (!data) return { ok: false, error: `El pedido #${id} cambió de estado mientras tanto.` };

  const resumen = cambiados.map((campo) => CAMPO_LABEL[campo]).join(", ");
  return {
    ok: true,
    pedido: data as Pedido,
    mensaje: `Pedido #${id} actualizado: ${resumen}.${noAplicado ? ` No apliqué: ${noAplicado}` : ""}`,
  };
}

/** Brief 005: the admin marks a queued order as finished, and a Telegram client is told it is ready. */
export async function marcarTerminado(id: number): Promise<ResultadoAccion> {
  if (!Number.isInteger(id)) return { ok: false, error: "Pedido inválido." };

  const { data, error } = await supabase()
    .from("pedidos")
    .update({ estado: "terminado" })
    .eq("id", id)
    .eq("estado", "en_cola") // only a queued order finishes, so the notice goes out once
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: `No se pudo marcar como terminado: ${error.message}` };
  if (!data) return { ok: false, error: `El pedido #${id} ya no está en la cola de producción.` };

  const pedido = data as Pedido;
  const mensaje = `Pedido #${id} terminado.`;
  if (pedido.telegram_chat_id === null) {
    return { ok: true, pedido, mensaje, advertencia: "No entró por Telegram: no hay a quién avisarle." };
  }
  const fallo = await avisarPorTelegram(pedido);
  if (fallo) return { ok: true, pedido, mensaje, advertencia: `No se pudo avisar por Telegram: ${fallo}` };
  return { ok: true, pedido, mensaje: `${mensaje} Le avisamos al cliente por Telegram.` };
}
