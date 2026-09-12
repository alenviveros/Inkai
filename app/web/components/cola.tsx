"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Printer } from "lucide-react";
import { TarjetaPedido } from "@/components/tarjeta-pedido";
import { TemaToggle } from "@/components/tema";
import { Badge } from "@/components/ui/badge";
import { ordenarPorLlegada, type Estado, type Pedido } from "@/lib/pedidos";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Columna {
  estado: Estado;
  titulo: string;
  descripcion: string;
}

// The order's life, left to right (briefs 001 and 005): borrador → pendiente de pago → en cola →
// terminado.
const COLUMNAS: Columna[] = [
  {
    estado: "borrador",
    titulo: "Borradores",
    descripcion: "El agente todavía está juntando datos.",
  },
  {
    estado: "pendiente_pago",
    titulo: "Pendientes de pago",
    descripcion: "Tarjeta completa. Confirmá cuando llegue la transferencia.",
  },
  {
    estado: "en_cola",
    titulo: "Cola de producción",
    descripcion: "Pago confirmado. Se produce por orden de llegada.",
  },
  {
    estado: "terminado",
    titulo: "Terminados",
    descripcion: "Listos para retirar o entregar. El cliente de Telegram ya tiene su aviso.",
  },
];

// Handing over to a person is brief 003; the column only shows up when there is one.
const DERIVADOS: Columna = {
  estado: "derivado",
  titulo: "Derivados",
  descripcion: "Los atiende una persona.",
};

const DESTACADO_MS = 2500;

interface Props {
  inicial: Pedido[];
  errorInicial: string | null;
}

export function Cola({ inicial, errorInicial }: Props) {
  const [pedidos, setPedidos] = useState(inicial);
  const [error, setError] = useState(errorInicial);
  const [enVivo, setEnVivo] = useState(false);
  const [destacados, setDestacados] = useState<ReadonlySet<number>>(new Set());
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const destacar = useCallback((id: number) => {
    setDestacados((prev) => new Set(prev).add(id));
    clearTimeout(timers.current.get(id));
    timers.current.set(
      id,
      setTimeout(() => {
        setDestacados((prev) => {
          const siguiente = new Set(prev);
          siguiente.delete(id);
          return siguiente;
        });
        timers.current.delete(id);
      }, DESTACADO_MS),
    );
  }, []);

  const aplicarCambio = useCallback(
    (pedido: Pedido) => {
      setPedidos((prev) => [...prev.filter((p) => p.id !== pedido.id), pedido]);
      destacar(pedido.id);
    },
    [destacar],
  );

  useEffect(() => {
    const db = supabase();

    async function recargar() {
      const { data, error: errorLectura } = await db.from("pedidos").select().order("id");
      if (errorLectura) {
        setError(errorLectura.message);
        return;
      }
      setError(null);
      setPedidos(data as Pedido[]);
    }

    const canal = db
      .channel("panel-pedidos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        (payload: RealtimePostgresChangesPayload<Pedido>) => {
          if (payload.eventType === "DELETE") {
            const id = payload.old.id;
            if (id !== undefined) setPedidos((prev) => prev.filter((p) => p.id !== id));
            return;
          }
          aplicarCambio(payload.new);
        },
      )
      .subscribe((status) => {
        setEnVivo(status === "SUBSCRIBED");
        // Catch anything that changed between the server render and the subscription.
        if (status === "SUBSCRIBED") void recargar();
      });

    const pendientes = timers.current;
    return () => {
      void db.removeChannel(canal);
      pendientes.forEach(clearTimeout);
    };
  }, [aplicarCambio]);

  const columnas = pedidos.some((p) => p.estado === "derivado") ? [...COLUMNAS, DERIVADOS] : COLUMNAS;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
            <Printer className="size-5" />
          </div>
          <div>
            <h1 className="text-xl leading-tight font-semibold">Print.ai · Printos</h1>
            <p className="text-muted-foreground text-sm">La IA propone, una persona confirma.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <span
              className={cn(
                "size-2 rounded-full",
                enVivo ? "bg-emerald-500" : "bg-muted-foreground/50",
              )}
            />
            {enVivo ? "En vivo" : "Conectando…"}
          </Badge>
          <TemaToggle />
        </div>
      </header>

      {error && (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          No se pudo leer la base: {error}
        </p>
      )}

      <main
        className={cn(
          "grid flex-1 items-start gap-4",
          columnas.length === 5 ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2 xl:grid-cols-4",
        )}
      >
        {columnas.map((columna) => {
          const lista = ordenarPorLlegada(pedidos.filter((p) => p.estado === columna.estado));
          return (
            <section
              key={columna.estado}
              aria-label={columna.titulo}
              className="bg-muted/40 flex flex-col gap-3 rounded-xl border p-3"
            >
              <div className="px-1">
                <h2 className="flex items-center justify-between text-sm font-semibold">
                  {columna.titulo}
                  <span className="text-muted-foreground font-normal tabular-nums">{lista.length}</span>
                </h2>
                <p className="text-muted-foreground text-xs">{columna.descripcion}</p>
              </div>
              {lista.length === 0 ? (
                <p className="text-muted-foreground px-1 py-6 text-center text-sm">Nada por acá.</p>
              ) : (
                lista.map((pedido, indice) => (
                  <TarjetaPedido
                    key={pedido.id}
                    pedido={pedido}
                    posicion={columna.estado === "en_cola" ? indice + 1 : undefined}
                    destacado={destacados.has(pedido.id)}
                    onCambio={aplicarCambio}
                  />
                ))
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
