-- A client often gives a day without an hour ("para mañana"). A single timestamptz cannot hold
-- "day known, hour unknown" without inventing an hour, so the contract splits it in two.
-- Contract: recursos/stack.md.
alter table public.pedidos drop column fecha_hora;
alter table public.pedidos
  add column fecha date, -- NULL = no date given: first come, first served
  add column hora  time; -- NULL = no hour given
