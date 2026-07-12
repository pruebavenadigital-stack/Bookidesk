-- Correcciones sugeridas por el advisor de seguridad de Supabase.

-- 1) Fijar search_path en la función de updated_at (evita search_path mutable)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) handle_new_user es solo un trigger: quitar su exposición como RPC vía API REST.
--    (El trigger sigue funcionando porque corre como dueño de la tabla.)
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- 3) El bucket público sirve las portadas por URL directa sin necesidad de una
--    política SELECT amplia; quitarla evita que un cliente liste todo el bucket.
drop policy if exists "covers_read_public" on storage.objects;
