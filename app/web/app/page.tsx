import { Cola } from "@/components/cola";
import { SinConfiguracion } from "@/components/sin-configuracion";
import type { Pedido } from "@/lib/pedidos";
import { supabase, supabaseConfigurado } from "@/lib/supabase";

// Always read the live queue; never serve a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function Panel() {
  if (!supabaseConfigurado) return <SinConfiguracion />;

  const { data, error } = await supabase().from("pedidos").select().order("id");
  return <Cola inicial={(data ?? []) as Pedido[]} errorInicial={error?.message ?? null} />;
}
