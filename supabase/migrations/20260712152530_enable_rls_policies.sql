-- Activar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.books    enable row level security;
alter table public.reviews  enable row level security;
alter table public.loans    enable row level security;

-- =========================================================
-- PROFILES: todos los autenticados leen; cada quien edita el suyo
-- =========================================================
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- =========================================================
-- BOOKS: cualquier autenticado gestiona el catálogo del hogar
-- (biblioteca compartida: sin restricción por fila, a propósito)
-- =========================================================
create policy "books_select_authenticated" on public.books
  for select to authenticated using (true);
create policy "books_insert_authenticated" on public.books
  for insert to authenticated with check (true);
create policy "books_update_authenticated" on public.books
  for update to authenticated using (true) with check (true);
create policy "books_delete_authenticated" on public.books
  for delete to authenticated using (true);

-- =========================================================
-- REVIEWS: todos leen; solo el autor escribe/edita/borra la suya
-- =========================================================
create policy "reviews_select_authenticated" on public.reviews
  for select to authenticated using (true);
create policy "reviews_insert_own" on public.reviews
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "reviews_update_own" on public.reviews
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "reviews_delete_own" on public.reviews
  for delete to authenticated using (user_id = (select auth.uid()));

-- =========================================================
-- LOANS: cualquier autenticado gestiona los préstamos del hogar
-- =========================================================
create policy "loans_select_authenticated" on public.loans
  for select to authenticated using (true);
create policy "loans_insert_authenticated" on public.loans
  for insert to authenticated with check (true);
create policy "loans_update_authenticated" on public.loans
  for update to authenticated using (true) with check (true);
create policy "loans_delete_authenticated" on public.loans
  for delete to authenticated using (true);
