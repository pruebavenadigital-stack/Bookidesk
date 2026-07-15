-- El drop de books.reading_status arrastró el índice compuesto (status, reading_status).
-- Se recrea sobre la columna vigente para el filtro biblioteca/deseos.
create index if not exists books_status_idx on public.books (status);
