-- Bucket para portadas subidas (cámara / archivo). Límite 2 MB, solo imágenes.
-- Lectura pública (las portadas no son sensibles y simplifica mostrarlas);
-- escritura/edición/borrado solo para usuarios autenticados.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'covers',
  'covers',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do nothing;

create policy "covers_insert_authenticated" on storage.objects
  for insert to authenticated with check (bucket_id = 'covers');
create policy "covers_update_authenticated" on storage.objects
  for update to authenticated using (bucket_id = 'covers') with check (bucket_id = 'covers');
create policy "covers_delete_authenticated" on storage.objects
  for delete to authenticated using (bucket_id = 'covers');

-- Nota: un bucket público sirve las portadas por URL directa sin necesidad de
-- una política SELECT sobre storage.objects. No se crea para evitar que un
-- cliente pueda listar todo el contenido del bucket (ver security_hardening).
