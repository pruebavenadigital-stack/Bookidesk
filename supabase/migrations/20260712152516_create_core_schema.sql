-- Extensión para búsqueda parcial rápida (buscar mientras se escribe)
create extension if not exists pg_trgm with schema extensions;

-- Función utilitaria: mantener updated_at al día
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- PERFILES: uno por miembro del hogar, ligado a Supabase Auth
-- =========================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_color text not null default '#6366f1',
  created_at   timestamptz not null default now()
);

-- Crear el perfil automáticamente cuando se crea un usuario en Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- LIBROS: modelo único para biblioteca y lista de deseos
-- =========================================================
create table public.books (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  author         text,
  isbn           text,
  cover_url      text,
  genre          text,
  publisher      text,
  published_year int,
  synopsis       text,
  tags           text[] not null default '{}',
  status         text not null default 'owned'
                 check (status in ('owned', 'wishlist')),
  reading_status text
                 check (reading_status in ('pendiente', 'leyendo', 'leido', 'abandonado')),
  wishlist_note  text,
  added_by       uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- un deseado no tiene estado de lectura; un libro en biblioteca sí
  constraint reading_status_matches_status check (
    (status = 'wishlist' and reading_status is null) or
    (status = 'owned'    and reading_status is not null)
  )
);

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- =========================================================
-- RESEÑAS Y CALIFICACIONES: una por usuario por libro
-- =========================================================
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.books(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  rating      numeric(2,1)
              check (rating >= 0.5 and rating <= 5 and (rating * 2) = floor(rating * 2)),
  review_text text check (char_length(review_text) <= 5000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (book_id, user_id),
  -- al menos estrellas o texto
  constraint rating_or_text check (rating is not null or review_text is not null)
);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- =========================================================
-- PRÉSTAMOS: activo = returned_at IS NULL; el resto es historial
-- =========================================================
create table public.loans (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid not null references public.books(id) on delete cascade,
  borrower_name text not null,
  loaned_at     date not null default current_date,
  returned_at   date,
  notes         text,
  created_by    uuid references public.profiles(id) on delete set null,
  constraint returned_after_loaned check (returned_at is null or returned_at >= loaned_at)
);

-- Máximo un préstamo activo por libro
create unique index one_active_loan_per_book
  on public.loans (book_id) where returned_at is null;

-- =========================================================
-- ÍNDICES de consulta frecuente
-- =========================================================
create index books_status_idx      on public.books (status, reading_status);
create index books_title_trgm_idx  on public.books using gin (title extensions.gin_trgm_ops);
create index books_author_trgm_idx on public.books using gin (author extensions.gin_trgm_ops);
create index books_added_by_idx    on public.books (added_by);
create index reviews_book_idx      on public.reviews (book_id);
create index reviews_user_idx      on public.reviews (user_id);
create index loans_book_idx        on public.loans (book_id);
