import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/** Rutas accesibles sin sesión iniciada. */
const PUBLIC_PREFIXES = ["/login", "/recuperar", "/actualizar-clave", "/auth"];

/**
 * Refresca la sesión de Supabase en cada request y protege las rutas privadas.
 * Se invoca desde `proxy.ts` (el reemplazo de middleware en Next 16).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // No metas lógica entre createServerClient y getUser(): refresca los tokens.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Con sesión: no dejar entrar al login otra vez.
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/biblioteca";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
