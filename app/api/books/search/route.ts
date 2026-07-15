import { NextResponse, type NextRequest } from "next/server";
import { searchBooks, lookupByIsbn } from "@/lib/book-metadata";
import { createClient } from "@/lib/supabase/server";

/**
 * Proxy de metadatos de libros (Google Books + Open Library).
 * Corre en el servidor: oculta la clave, evita CORS y exige sesión.
 * Uso: /api/books/search?q=... o /api/books/search?isbn=...
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "no-auth" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn")?.trim();
  const q = searchParams.get("q")?.trim();

  try {
    if (isbn) {
      const book = await lookupByIsbn(isbn);
      return NextResponse.json({ results: book ? [book] : [] });
    }
    if (q) {
      const results = await searchBooks(q, 10);
      return NextResponse.json({ results });
    }
    return NextResponse.json({ results: [] });
  } catch {
    return NextResponse.json({ error: "search-failed", results: [] });
  }
}
