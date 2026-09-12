// Order rules for the admin panel. Mirrors app/bot/agent/lib/pedidos.ts: the bot and the panel
// only meet in Supabase, so each package keeps its own copy of these few rules.
// Source of truth: 02_producto/briefs/001_pedido-desde-conversacion.md + recursos/catalogo.md.
// Change a rule there first, then in both copies.

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
export type Estado = "borrador" | "pendiente_pago" | "en_cola" | "terminado" | "derivado";

// A type alias, not an interface: Supabase Realtime's generics need an index-compatible type.
export type Pedido = {
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
};

export type CamposEditables = Pick<
  Pedido,
  "cantidad" | "tamano" | "color" | "archivo" | "papel" | "entrega" | "fecha" | "hora"
>;
type Obligatorios = Pick<Pedido, "cantidad" | "tamano" | "color" | "archivo" | "entrega">;

export const CAMPO_LABEL: Record<keyof CamposEditables, string> = {
  cantidad: "cantidad",
  tamano: "tamaño",
  color: "color",
  archivo: "archivo",
  papel: "papel",
  entrega: "entrega",
  fecha: "fecha",
  hora: "hora",
};

// Required fields (brief 001). A null here *is* a missing field: no defaults.
const OBLIGATORIOS: ReadonlyArray<keyof Obligatorios> = [
  "cantidad",
  "tamano",
  "color",
  "archivo",
  "entrega",
];

// Orders a person can still modify. Once in the queue, the order is being produced.
export const EDITABLES: readonly Estado[] = ["borrador", "pendiente_pago"];

export function faltantes(p: Obligatorios): string[] {
  return OBLIGATORIOS.filter((campo) => p[campo] === null || p[campo] === undefined).map(
    (campo) => CAMPO_LABEL[campo],
  );
}

// borrador until every required field is there, then pendiente_pago.
// Only Confirmar moves it on to en_cola (brief 001).
export function estadoPara(p: Obligatorios): Estado {
  return faltantes(p).length === 0 ? "pendiente_pago" : "borrador";
}

// Large sizes are printed only on Normal 85 g (recursos/catalogo.md, "Papel").
export function papelIncompatible(tamano: string | null, papel: string | null): string | null {
  if (tamano && papel && TAMANOS_GRANDES.includes(tamano) && papel !== PAPEL_TAMANO_GRANDE) {
    return `${tamano} solo se imprime en ${PAPEL_TAMANO_GRANDE}, no en ${papel}.`;
  }
  return null;
}

export const ESTADO_LABEL: Record<Estado, string> = {
  borrador: "Borrador",
  pendiente_pago: "Pendiente de pago",
  en_cola: "En cola",
  terminado: "Terminado",
  derivado: "Derivado",
};
export const COLOR_LABEL: Record<Color, string> = { color: "Color", byn: "Blanco y negro" };
export const ARCHIVO_LABEL: Record<Archivo, string> = {
  pdf: "PDF",
  imagen: "Imagen",
  otro: "Otro archivo imprimible",
};
export const ENTREGA_LABEL: Record<Entrega, string> = {
  retiro: "Retiro en el local",
  delivery: "Delivery",
};

export function fechaEntrega(p: Pick<Pedido, "fecha" | "hora">): string | null {
  if (!p.fecha) return null;
  const [anio, mes, dia] = p.fecha.split("-");
  return `${dia}/${mes}/${anio}${p.hora ? `, ${p.hora.slice(0, 5)}` : ""}`;
}

const HORA_ASUNCION = new Intl.DateTimeFormat("es-PY", {
  timeZone: "America/Asuncion",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Arrival time in Asunción. Accepts both REST and Realtime timestamp formats. */
export function horaLlegada(createdAt: string): string {
  const iso = createdAt.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? "" : HORA_ASUNCION.format(fecha);
}

// The id is correlative, so it is also the arrival order (Printos attends by order of arrival).
export function ordenarPorLlegada(pedidos: Pedido[]): Pedido[] {
  return [...pedidos].sort((a, b) => a.id - b.id);
}
