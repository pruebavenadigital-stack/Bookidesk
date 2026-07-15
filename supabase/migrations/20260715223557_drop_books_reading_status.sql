-- Cierre de la migración a estado por miembro: books.reading_status ya no se usa
-- (el código en producción lee/escribe reading_statuses desde el deploy anterior).
alter table public.books drop constraint if exists reading_status_matches_status;
alter table public.books drop column if exists reading_status;
