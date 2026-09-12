-- Brief 002: the file a client sends by Telegram opens from its order card in the panel.
alter table public.pedidos
  add column archivo_path text; -- object path in the "archivos" bucket; NULL = no file received

-- Private bucket: photos and PDFs up to 20 MB, Telegram's limit for bot downloads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('archivos', 'archivos', false, 20971520, array['image/*', 'application/pdf']);

-- No login (01_negocio/decisiones.md): the panel's anon key may read files to open them through a
-- short-lived signed link. Only the bot uploads, with the service role, which bypasses RLS.
create policy "panel reads archivos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'archivos');
