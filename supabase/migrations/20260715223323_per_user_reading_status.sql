-- ESTADO DE LECTURA POR MIEMBRO (PRD v1.2, evolución de la decisión §8.1).
-- Modelo disperso: sin fila = 'pendiente'. La marca es personal (RLS como reviews).

create table public.reading_statuses (
  book_id    uuid not null references public.books(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  status     text not null check (status in ('pendiente','leyendo','leido','abandonado')),
  updated_at timestamptz not null default now(),
  primary key (book_id, user_id)
);

create index reading_statuses_user_idx on public.reading_statuses (user_id);

create trigger reading_statuses_set_updated_at
  before update on public.reading_statuses
  for each row execute function public.set_updated_at();

alter table public.reading_statuses enable row level security;

create policy "reading_statuses_select_authenticated" on public.reading_statuses
  for select to authenticated using (true);
create policy "reading_statuses_insert_own" on public.reading_statuses
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "reading_statuses_update_own" on public.reading_statuses
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "reading_statuses_delete_own" on public.reading_statuses
  for delete to authenticated using (user_id = (select auth.uid()));

-- Migración de datos: todas las marcas existentes eran de Laura (constatado:
-- ella cargó la biblioteca y Daniela aún no marcaba nada). Las 'pendiente' no se
-- copian porque la ausencia de fila YA significa pendiente.
insert into public.reading_statuses (book_id, user_id, status)
select b.id, u.id, b.reading_status
from public.books b
cross join (select id from auth.users where email = 'laura@venadigital.com.co') u
where b.status = 'owned'
  and b.reading_status is not null
  and b.reading_status <> 'pendiente';

-- NOTA: books.reading_status se elimina en una migración posterior
-- (drop_books_reading_status), tras redesplegar el código nuevo — así el
-- despliegue anterior sigue funcionando durante la ventana de deploy.
