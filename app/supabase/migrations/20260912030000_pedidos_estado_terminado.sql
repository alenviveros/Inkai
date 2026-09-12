-- Brief 005: a queued order can be marked finished, and a Telegram client is told it is ready.
alter table public.pedidos drop constraint pedidos_estado_check;
alter table public.pedidos add constraint pedidos_estado_check
  check (estado in ('borrador', 'pendiente_pago', 'en_cola', 'terminado', 'derivado'));
