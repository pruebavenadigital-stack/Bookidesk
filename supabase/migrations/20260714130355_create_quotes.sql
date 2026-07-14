-- CITAS: pasajes memorables por libro, contenido compartido del hogar (PRD F9, §8.4)
create table public.quotes (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.books(id) on delete cascade,
  quote_text  text not null check (char_length(quote_text) <= 2000),
  page_number int check (page_number > 0),
  added_by    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

create index quotes_book_idx on public.quotes (book_id);

-- RLS: gestión compartida por el hogar (como books y loans), con autoría informativa
alter table public.quotes enable row level security;

create policy "quotes_select_authenticated" on public.quotes
  for select to authenticated using (true);
create policy "quotes_insert_authenticated" on public.quotes
  for insert to authenticated with check (true);
create policy "quotes_update_authenticated" on public.quotes
  for update to authenticated using (true) with check (true);
create policy "quotes_delete_authenticated" on public.quotes
  for delete to authenticated using (true);
