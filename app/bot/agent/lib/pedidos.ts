// Order-card logic shared by the bot tools.
// Business rules: 02_producto/briefs/001_pedido-desde-conversacion.md + recursos/catalogo.md.
// Table contract: recursos/stack.md. This module applies those rules; it does not define them.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Closed catalog (recursos/catalogo.md). Must match the CHECK constraints in app/supabase/migrations.
export const TAMANOS = ["Carta", "A4", "Oficio", "A3", "A3+", "A2", "A1", "A0"] as const;
export const COLORES = ["color", "byn"] as const;
export const ARCHIVOS = ["pdf", "imagen", "otro"] as const;
export const ENTREGAS = ["retiro", "delivery"] as const;
export const PAPELES = [
  "Normal 85 g",
  "Ilustración brillo 110 g",
  "Ilustración brillo 240 g",
  "Cartulina blanca",
  "Cartulina hilo",
  "Vegetal",
  "Triplex",
  "Kraft",
  "Adhesivo",
] as const;
const TAMANOS_GRANDES: readonly string[] = ["A2", "A1", "A0"];
const PAPEL_TAMANO_GRANDE = "Normal 85 g";

export type Tamano = (typeof TAMANOS)[number];
export type Color = (typeof COLORES)[number];
export type Archivo = (typeof ARCHIVOS)[number];
export type Entrega = (typeof ENTREGAS)[number];
export type Papel = (typeof PAPELES)[number];
export type Estado = "borrador" | "pendiente_pago" | "en_cola" | "terminado" | "derivado";

export interface Pedido {
  id: number;
  estado: Estado;
  cantidad: number | null;
  tamano: Tamano | null;
  color: Color | null;
  archivo: Archivo | null;
  archivo_path: string | null; // object path in the "archivos" bucket (brief 002)
  papel: string | null;
  entrega: Entrega | null;
  fecha: string | null; // YYYY-MM-DD
  hora: string | null; // HH:MM:SS
  telegram_chat_id: number | null;
  motivo_derivacion: string | null;
  created_at: string;
}

/** What the client told the bot. `undefined` = not said. The bot never writes null over a value. */
export interface CamposPedido {
  cantidad?: number;
  tamano?: Tamano;
  color?: Color;
  archivo?: Archivo;
  archivo_path?: string; // set by the tools when a file arrives, never by the model
  papel?: Papel;
  entrega?: Entrega;
  fecha?: string;
  hora?: string;
}

export interface ResultadoPedido {
  pedido: Pedido;
  faltantes: string[];
  tarjeta: string;
}

type Obligatorios = Pick<Pedido, "cantidad" | "tamano" | "color" | "archivo" | "entrega">;

// Required fields and their card labels (brief 001). A null here *is* a missing field: no defaults.
const OBLIGATORIOS: ReadonlyArray<readonly [keyof Obligatorios, string]> = [
  ["cantidad", "cantidad"],
  ["tamano", "tamaño"],
  ["color", "color"],
  ["archivo", "archivo"],
  ["entrega", "entrega"],
];

// The bot may only touch orders a person has not taken over yet.
const EDITABLES: readonly Estado[] = ["borrador", "pendiente_pago"];

let client: SupabaseClient | undefined;

function db(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in app/bot/.env.local");
    }
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

export function faltantes(p: Obligatorios): string[] {
  return OBLIGATORIOS.filter(([campo]) => p[campo] === null || p[campo] === undefined).map(
    ([, label]) => label,
  );
}

// borrador until every required field is there, then pendiente_pago.
// Only a person moves it on to en_cola, from the dashboard (brief 001).
function estadoPara(p: Obligatorios): Estado {
  return faltantes(p).length === 0 ? "pendiente_pago" : "borrador";
}

// Large sizes are printed only on Normal 85 g (recursos/catalogo.md, "Papel").
function validarPapel(tamano: string | null | undefined, papel: string | null | undefined): void {
  if (tamano && papel && TAMANOS_GRANDES.includes(tamano) && papel !== PAPEL_TAMANO_GRANDE) {
    throw new Error(
      `Incompatible: ${tamano} is printed only on ${PAPEL_TAMANO_GRANDE}, not on "${papel}". ` +
        "Tell the client and ask what they prefer. Do not change either value yourself.",
    );
  }
}

function definidos(campos: CamposPedido): CamposPedido {
  return Object.fromEntries(
    Object.entries(campos).filter(([, valor]) => valor !== undefined),
  ) as CamposPedido;
}

function noEditable(p: Pedido): string {
  if (p.estado === "en_cola") {
    return `Order #${p.id} is already in the production queue: its payment was confirmed. Only a person at Printos can change it now.`;
  }
  if (p.estado === "terminado") {
    return `Order #${p.id} is already finished and ready. Only a person at Printos can change it now.`;
  }
  return `Order #${p.id} was handed over to a person at Printos. Only they can change it now.`;
}

/** Stores a client's file in the private "archivos" bucket and returns its object path (brief 002). */
export async function subirArchivo(bytes: Uint8Array, nombre: string, mediaType: string): Promise<string> {
  const path = `telegram/${crypto.randomUUID()}-${nombre}`;
  const { error } = await db()
    .storage.from("archivos")
    .upload(path, bytes, { contentType: mediaType, upsert: false });
  if (error) throw new Error(`Could not store the client's file: ${error.message}`);
  return path;
}

/** Brief 005: remembers the Telegram chat an order came from, so the panel can tell the client it is ready. */
export async function guardarChatTelegram(id: number, chatId: string): Promise<void> {
  const chat = Number(chatId);
  if (!Number.isSafeInteger(chat)) return;
  const { error } = await db()
    .from("pedidos")
    .update({ telegram_chat_id: chat })
    .eq("id", id)
    .is("telegram_chat_id", null);
  if (error) throw new Error(`Could not save the Telegram chat for order #${id}: ${error.message}`);
}

export async function obtenerPedido(id: number): Promise<Pedido | null> {
  const { data, error } = await db().from("pedidos").select().eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not read order #${id}: ${error.message}`);
  return data as Pedido | null;
}

export async function crearPedido(campos: CamposPedido): Promise<ResultadoPedido> {
  const valores = definidos(campos);
  validarPapel(valores.tamano, valores.papel);
  const fila = { cantidad: null, tamano: null, color: null, archivo: null, entrega: null, ...valores };
  const { data, error } = await db()
    .from("pedidos")
    .insert({ ...valores, estado: estadoPara(fila) })
    .select()
    .single();
  if (error) throw new Error(`Could not create the order: ${error.message}`);
  return resultado(data as Pedido);
}

export async function actualizarPedido(id: number, campos: CamposPedido): Promise<ResultadoPedido> {
  const valores = definidos(campos);
  if (Object.keys(valores).length === 0) {
    throw new Error("Nothing to update: pass only the fields the client gave or changed.");
  }
  const actual = await obtenerPedido(id);
  if (!actual) throw new Error(`Order #${id} does not exist.`);
  if (!EDITABLES.includes(actual.estado)) throw new Error(noEditable(actual));

  const fila = { ...actual, ...valores };
  validarPapel(fila.tamano, fila.papel);
  const { data, error } = await db()
    .from("pedidos")
    .update({ ...valores, estado: estadoPara(fila) })
    .eq("id", id)
    .in("estado", [...EDITABLES]) // a person may have confirmed it in the meantime
    .select()
    .maybeSingle();
  if (error) throw new Error(`Could not update order #${id}: ${error.message}`);
  if (!data) throw new Error(`Order #${id} changed state meanwhile. A person at Printos is handling it.`);
  return resultado(data as Pedido);
}

const ESTADO_LABEL: Record<Estado, string> = {
  borrador: "Borrador",
  pendiente_pago: "Pendiente de pago",
  en_cola: "En cola de producción",
  terminado: "Terminado",
  derivado: "Derivado a una persona",
};
const COLOR_LABEL: Record<Color, string> = { color: "Color", byn: "Blanco y negro" };
const ARCHIVO_LABEL: Record<Archivo, string> = {
  pdf: "PDF",
  imagen: "Imagen",
  otro: "Otro archivo imprimible",
};
const ENTREGA_LABEL: Record<Entrega, string> = { retiro: "Retiro en el local", delivery: "Delivery" };
const FALTA = "⚠️ falta";

/** The order card as the client and the admin read it (brief 001). */
export function tarjeta(p: Pedido): string {
  let cuando = "sin fecha (por orden de llegada)";
  if (p.fecha) {
    const [anio, mes, dia] = p.fecha.split("-");
    cuando = `${dia}/${mes}/${anio}${p.hora ? `, ${p.hora.slice(0, 5)}` : ""}`;
  }
  const lineas = [
    `🧾 Pedido #${p.id} · ${ESTADO_LABEL[p.estado]}`,
    `Cantidad: ${p.cantidad ?? FALTA}`,
    `Tamaño: ${p.tamano ?? FALTA}`,
    `Color: ${p.color ? COLOR_LABEL[p.color] : FALTA}`,
    `Archivo: ${p.archivo ? `${ARCHIVO_LABEL[p.archivo]}${p.archivo_path ? " ✅ recibido" : ""}` : FALTA}`,
    `Entrega: ${p.entrega ? ENTREGA_LABEL[p.entrega] : FALTA}`,
    `Para: ${cuando}`,
  ];
  if (p.papel) lineas.push(`Papel: ${p.papel}`);
  const falta = faltantes(p);
  if (falta.length > 0) lineas.push("", `⚠️ Falta: ${falta.join(" · ")}`);
  return lineas.join("\n");
}

function resultado(pedido: Pedido): ResultadoPedido {
  return { pedido, faltantes: faltantes(pedido), tarjeta: tarjeta(pedido) };
}

/** What the model reads back from a tool: the card, plus the next step the brief requires. */
export function paraModelo(r: ResultadoPedido): string {
  let siguiente = "Next: show this card to the client exactly as it is.";
  if (r.faltantes.length > 0) {
    siguiente =
      "Next: show this card exactly as it is, then ask in one short message for: " +
      `${r.faltantes.join(", ")}. Do not assume any of them.`;
  } else if (r.pedido.estado === "pendiente_pago") {
    siguiente =
      "Next: show this card exactly as it is. The order is complete and pending payment: tell the " +
      "client that Printos works only with prior bank transfer, that a person will send the amount " +
      "and the transfer details, and that the order enters the production queue once a person " +
      "confirms the payment. Give no price.";
  }
  return `${r.tarjeta}\n\n${siguiente}`;
}
