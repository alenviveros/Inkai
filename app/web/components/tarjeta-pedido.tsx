"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Loader2, PackageCheck, Paperclip, Pencil } from "lucide-react";
import { toast } from "sonner";
import { confirmarPago, marcarTerminado, modificarPedido } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ARCHIVO_LABEL,
  COLOR_LABEL,
  EDITABLES,
  ENTREGA_LABEL,
  ESTADO_LABEL,
  faltantes,
  fechaEntrega,
  horaLlegada,
  type Estado,
  type Pedido,
} from "@/lib/pedidos";
import { cn } from "@/lib/utils";

const BADGE: Record<Estado, "default" | "secondary" | "outline" | "destructive"> = {
  borrador: "secondary",
  pendiente_pago: "outline",
  en_cola: "default",
  terminado: "secondary",
  derivado: "destructive",
};

interface Props {
  pedido: Pedido;
  /** Position in the production queue, shown only there. */
  posicion?: number;
  destacado?: boolean;
  onCambio: (pedido: Pedido) => void;
}

export function TarjetaPedido({ pedido, posicion, destacado = false, onCambio }: Props) {
  const [editando, setEditando] = useState(false);
  const [instruccion, setInstruccion] = useState("");
  const [modificando, startModificar] = useTransition();
  const [confirmando, startConfirmar] = useTransition();
  const [terminando, startTerminar] = useTransition();
  const campoInstruccion = useRef<HTMLTextAreaElement>(null);

  // Keep the cursor in the correction box when it opens and after a rejected change, so the admin
  // can fix the text right away. The box is disabled, and loses focus, while the change runs.
  useEffect(() => {
    if (editando && !modificando) campoInstruccion.current?.focus();
  }, [editando, modificando]);

  const falta = faltantes(pedido);
  const editable = EDITABLES.includes(pedido.estado);
  const cuando = fechaEntrega(pedido);

  const filas: Array<[string, string | number | null]> = [
    ["Cantidad", pedido.cantidad],
    ["Tamaño", pedido.tamano],
    ["Color", pedido.color && COLOR_LABEL[pedido.color]],
    ["Archivo", pedido.archivo && ARCHIVO_LABEL[pedido.archivo]],
    ["Entrega", pedido.entrega && ENTREGA_LABEL[pedido.entrega]],
  ];

  function aplicarModificacion() {
    if (!instruccion.trim()) return;
    startModificar(async () => {
      const resultado = await modificarPedido(pedido.id, instruccion);
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }
      onCambio(resultado.pedido);
      setEditando(false);
      setInstruccion("");
      toast.success(resultado.mensaje);
    });
  }

  function confirmar() {
    startConfirmar(async () => {
      const resultado = await confirmarPago(pedido.id);
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }
      onCambio(resultado.pedido);
      toast.success(resultado.mensaje);
    });
  }

  function terminar() {
    startTerminar(async () => {
      const resultado = await marcarTerminado(pedido.id);
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }
      onCambio(resultado.pedido);
      toast.success(resultado.mensaje);
      if (resultado.advertencia) toast.warning(resultado.advertencia);
    });
  }

  return (
    <Card
      className={cn(
        "gap-3 py-4 transition-shadow duration-500",
        destacado && "ring-primary/70 shadow-lg ring-2",
      )}
    >
      <CardHeader className="gap-0.5 px-4">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>
            {posicion !== undefined && (
              <span className="text-muted-foreground mr-1.5 font-normal tabular-nums">
                {posicion}.
              </span>
            )}
            Pedido #{pedido.id}
          </span>
          <Badge variant={BADGE[pedido.estado]}>{ESTADO_LABEL[pedido.estado]}</Badge>
        </CardTitle>
        <p className="text-muted-foreground text-xs">Llegó a las {horaLlegada(pedido.created_at)}</p>
      </CardHeader>

      <CardContent className="px-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {filas.map(([label, valor]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className={cn(valor === null && "font-medium text-amber-600 dark:text-amber-400")}>
                {valor ?? "⚠️ falta"}
              </dd>
            </div>
          ))}
          <dt className="text-muted-foreground">Para</dt>
          <dd>{cuando ?? "Sin fecha, por orden de llegada"}</dd>
          {pedido.papel && (
            <>
              <dt className="text-muted-foreground">Papel</dt>
              <dd>{pedido.papel}</dd>
            </>
          )}
        </dl>

        {pedido.archivo_path && (
          <a
            href={`/archivo/${pedido.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          >
            <Paperclip className="size-4" />
            Abrir archivo del cliente
          </a>
        )}

        {falta.length > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            Falta: {falta.join(" · ")}
          </p>
        )}

        {pedido.motivo_derivacion && (
          <p className="text-muted-foreground mt-3 text-sm">Motivo: {pedido.motivo_derivacion}</p>
        )}

        {editando && (
          <div className="mt-3 space-y-2">
            <Textarea
              ref={campoInstruccion}
              rows={2}
              maxLength={500}
              value={instruccion}
              disabled={modificando}
              placeholder="Ej.: que sean 60, en A3 y blanco y negro"
              onChange={(evento) => setInstruccion(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === "Enter" && (evento.ctrlKey || evento.metaKey)) aplicarModificacion();
                if (evento.key === "Escape" && !modificando) setEditando(false);
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={modificando}
                onClick={() => setEditando(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={modificando || !instruccion.trim()}
                onClick={aplicarModificacion}
              >
                {modificando && <Loader2 className="animate-spin" />}
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {editable && !editando && (
        <CardFooter className="gap-2 px-4">
          <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
            <Pencil />
            Modificar
          </Button>
          {pedido.estado === "pendiente_pago" && (
            <Button size="sm" className="ml-auto" disabled={confirmando} onClick={confirmar}>
              {confirmando ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Confirmar pago
            </Button>
          )}
        </CardFooter>
      )}

      {pedido.estado === "en_cola" && (
        <CardFooter className="px-4">
          <Button size="sm" className="ml-auto" disabled={terminando} onClick={terminar}>
            {terminando ? <Loader2 className="animate-spin" /> : <PackageCheck />}
            Marcar terminado
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
