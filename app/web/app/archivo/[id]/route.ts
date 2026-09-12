import { NextResponse } from "next/server";
import { supabase, supabaseConfigurado } from "@/lib/supabase";

const LINK_SEGUNDOS = 60;

// Opens the file a client sent for an order (brief 002). The bucket is private, so this hands out a
// short-lived signed link. There is no login (01_negocio/decisiones.md): anyone with the panel can
// open it.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numero = Number(id);
  if (!supabaseConfigurado || !Number.isInteger(numero)) {
    return new NextResponse("Pedido inválido.", { status: 400 });
  }

  const db = supabase();
  const { data, error } = await db
    .from("pedidos")
    .select("archivo_path")
    .eq("id", numero)
    .maybeSingle();
  if (error) return new NextResponse("No se pudo leer el pedido.", { status: 502 });
  if (!data?.archivo_path) return new NextResponse("Este pedido no tiene archivo.", { status: 404 });

  const firmado = await db.storage.from("archivos").createSignedUrl(data.archivo_path, LINK_SEGUNDOS);
  if (firmado.error) return new NextResponse("No se pudo abrir el archivo.", { status: 502 });

  return NextResponse.redirect(firmado.data.signedUrl);
}
