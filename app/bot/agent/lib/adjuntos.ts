// Files the client sends in the chat (brief 002).
// The Telegram channel downloads photos and PDFs into the agent workspace, under
// /workspace/attachments/<hash>/<file name>. The order tools call `tomarAdjuntoNuevo` to upload the
// newest one to Supabase Storage and attach it to the order card.
import { defineState } from "eve/context";
import type { ToolContext } from "eve/tools";
import { subirArchivo, type Archivo } from "./pedidos";

type Sandbox = Awaited<ReturnType<ToolContext["getSandbox"]>>;

const RAIZ = "/workspace/attachments";

// Workspace paths already attached to an order in this conversation.
const adjuntosUsados = defineState(
  "printai.adjuntos-usados",
  (): { paths: string[] } => ({ paths: [] }),
);

interface Tipo {
  archivo: Archivo;
  mediaType: string;
  extension: string;
}

const PDF: Tipo = { archivo: "pdf", mediaType: "application/pdf", extension: "pdf" };
const JPEG: Tipo = { archivo: "imagen", mediaType: "image/jpeg", extension: "jpg" };
const PNG: Tipo = { archivo: "imagen", mediaType: "image/png", extension: "png" };
const WEBP: Tipo = { archivo: "imagen", mediaType: "image/webp", extension: "webp" };
const HEIC: Tipo = { archivo: "imagen", mediaType: "image/heic", extension: "heic" };

const POR_EXTENSION: Record<string, Tipo> = { pdf: PDF, jpg: JPEG, jpeg: JPEG, png: PNG, webp: WEBP, heic: HEIC };

// The file's first bytes decide; the extension is only a fallback (a file may arrive without one).
function tipoDe(bytes: Uint8Array, nombre: string): Tipo | null {
  const empieza = (...firma: number[]) => firma.every((byte, i) => bytes[i] === byte);
  if (empieza(0x25, 0x50, 0x44, 0x46)) return PDF; // %PDF
  if (empieza(0xff, 0xd8, 0xff)) return JPEG;
  if (empieza(0x89, 0x50, 0x4e, 0x47)) return PNG;
  if (empieza(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return WEBP;
  return POR_EXTENSION[nombre.split(".").at(-1)?.toLowerCase() ?? ""] ?? null;
}

export interface AdjuntoNuevo {
  archivo: Archivo;
  archivo_path: string;
  /** Every new workspace path seen now. Mark them used once the order is saved. */
  vistos: string[];
}

async function listar(sandbox: Sandbox, carpeta: string): Promise<string[]> {
  // Names are safe: eve keeps only [A-Za-z0-9_.-] in staged file names, and the folder is a hash.
  const resultado = await sandbox.run({ command: `ls -1 '${carpeta}'` });
  if (resultado.exitCode !== 0) return [];
  return resultado.stdout
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

/** Uploads the newest file from the chat that is not attached yet. Null when there is none. */
export async function tomarAdjuntoNuevo(ctx: ToolContext): Promise<AdjuntoNuevo | null> {
  const sandbox = await ctx.getSandbox();
  const carpetas = await listar(sandbox, RAIZ);
  const paths = (
    await Promise.all(
      carpetas.map(async (carpeta) =>
        (await listar(sandbox, `${RAIZ}/${carpeta}`)).map((nombre) => `${RAIZ}/${carpeta}/${nombre}`),
      ),
    )
  ).flat();

  const usados = adjuntosUsados.get().paths;
  const vistos = paths.filter((path) => !usados.includes(path));
  // Brief 002: one file per order. If several arrived at once, the last one listed wins.
  const path = vistos.at(-1);
  if (!path) return null;

  const bytes = await sandbox.readBinaryFile({ path });
  if (!bytes) return null;

  const nombre = path.split("/").at(-1) ?? "archivo";
  const tipo = tipoDe(bytes, nombre);
  if (!tipo) return null; // the channel only lets photos and PDFs through

  const conExtension = nombre.includes(".") ? nombre : `${nombre}.${tipo.extension}`;
  const archivo_path = await subirArchivo(bytes, conExtension, tipo.mediaType);
  return { archivo: tipo.archivo, archivo_path, vistos };
}

export function marcarAdjuntosUsados(paths: string[]): void {
  adjuntosUsados.update((estado) => ({ paths: [...estado.paths, ...paths] }));
}
