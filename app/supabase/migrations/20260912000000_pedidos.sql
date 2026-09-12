-- pedidos: the single contract between app/bot (writer) and app/web (reader + estado updates).
-- Contract: recursos/stack.md. Business rules: 02_producto/briefs/001_pedido-desde-conversacion.md
-- and recursos/catalogo.md. A required field left NULL *is* a missing field (no defaults).

create table public.pedidos (
  id                bigint generated always as identity primary key, -- correlative, never reused
  estado            text not null default 'borrador'
                    check (estado in ('borrador', 'pendiente_pago', 'en_cola', 'derivado')),
  cantidad          integer check (cantidad > 0),
  tamano            text check (tamano in ('Carta', 'A4', 'Oficio', 'A3', 'A3+', 'A2', 'A1', 'A0')),
  color             text check (color in ('color', 'byn')),
  archivo           text check (archivo in ('pdf', 'imagen', 'otro')), -- NULL = no file received yet
  papel             text,                                               -- NULL = client did not mention it
  entrega           text check (entrega in ('retiro', 'delivery')),
  fecha_hora        timestamptz,                                        -- NULL = first come, first served
  telegram_chat_id  bigint,                                             -- brief 002
  motivo_derivacion text,                                               -- brief 003
  created_at        timestamptz not null default now()
);

comment on table public.pedidos is
  'Print orders. Contract: recursos/stack.md. Rules: briefs/001 + recursos/catalogo.md.';

-- Queue view: by estado, then arrival order.
create index pedidos_estado_created_at_idx on public.pedidos (estado, created_at);

-- RLS: the bot writes with the service role (bypasses RLS). The dashboard uses the anon key
-- (no login in scope, brief 001) so it may read the queue and change estado, nothing else.
alter table public.pedidos enable row level security;

create policy "dashboard reads pedidos"
  on public.pedidos for select
  to anon, authenticated
  using (true);

create policy "dashboard updates pedidos"
  on public.pedidos for update
  to anon, authenticated
  using (true)
  with check (true);

-- Realtime: the dashboard queue subscribes to changes on this table.
alter publication supabase_realtime add table public.pedidos;
