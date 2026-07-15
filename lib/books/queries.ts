import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/supabase/types";

export type BookWithMeta = Book & {
  avgRating: number | null;
  ratingCount: number;
  activeLoan: { borrower_name: string } | null;
};

type ReviewRow = { rating: number | null };
type LoanRow = { borrower_name: string; returned_at: string | null };

function enrich(
  row: Book & { reviews?: ReviewRow[]; loans?: LoanRow[] },
): BookWithMeta {
  const ratings = (row.reviews ?? [])
    .map((r) => r.rating)
    .filter((r): r is number => r != null);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;
  const active = (row.loans ?? []).find((l) => l.returned_at === null) ?? null;
  return {
    ...row,
    avgRating,
    ratingCount: ratings.length,
    activeLoan: active ? { borrower_name: active.borrower_name } : null,
  };
}

/** Catálogo: libros de la biblioteca (owned) con promedio y préstamo activo. */
export async function getOwnedBooks(): Promise<BookWithMeta[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*, reviews(rating), loans(borrower_name, returned_at)")
    .eq("status", "owned")
    .order("created_at", { ascending: false });
  return (data ?? []).map(enrich);
}

/** Lista de deseos (wishlist). */
export async function getWishlist(): Promise<Book[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("status", "wishlist")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export type LibraryCounts = {
  total: number;
  leidos: number;
  pendientes: number;
  leyendo: number;
};

export function computeCounts(books: BookWithMeta[]): LibraryCounts {
  return {
    total: books.length,
    leidos: books.filter((b) => b.reading_status === "leido").length,
    pendientes: books.filter((b) => b.reading_status === "pendiente").length,
    leyendo: books.filter((b) => b.reading_status === "leyendo").length,
  };
}

export type ReviewWithAuthor = {
  id: string;
  rating: number | null;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: { display_name: string; avatar_color: string } | null;
};

export type QuoteWithAuthor = {
  id: string;
  quote_text: string;
  page_number: number | null;
  created_at: string;
  added_by: string | null;
  profiles: { display_name: string; avatar_color: string } | null;
};

export type LoanRecord = {
  id: string;
  borrower_name: string;
  loaned_at: string;
  returned_at: string | null;
  notes: string | null;
};

export type BookDetail = Book & {
  reviews: ReviewWithAuthor[];
  quotes: QuoteWithAuthor[];
  loans: LoanRecord[];
};

/** Ficha completa de un libro con reseñas, citas y préstamos. */
export async function getBookDetail(id: string): Promise<BookDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select(
      `*,
       reviews(id, rating, review_text, created_at, updated_at, user_id, profiles(display_name, avatar_color)),
       quotes(id, quote_text, page_number, created_at, added_by, profiles(display_name, avatar_color)),
       loans(id, borrower_name, loaned_at, returned_at, notes)`,
    )
    .eq("id", id)
    .single();

  if (!data) return null;

  const detail = data as unknown as BookDetail;
  // Citas: por página (las que la tengan) y luego por fecha.
  detail.quotes = [...(detail.quotes ?? [])].sort((a, b) => {
    if (a.page_number != null && b.page_number != null)
      return a.page_number - b.page_number;
    if (a.page_number != null) return -1;
    if (b.page_number != null) return 1;
    return a.created_at.localeCompare(b.created_at);
  });
  // Préstamos: activos primero, luego por fecha desc.
  detail.loans = [...(detail.loans ?? [])].sort((a, b) =>
    b.loaned_at.localeCompare(a.loaned_at),
  );
  return detail;
}

export type ActiveLoan = {
  id: string;
  borrower_name: string;
  loaned_at: string;
  notes: string | null;
  book: {
    id: string;
    title: string;
    author: string | null;
    cover_url: string | null;
  };
};

/** Préstamos activos (sin devolver), del más antiguo al más reciente. */
export async function getActiveLoans(): Promise<ActiveLoan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loans")
    .select("id, borrower_name, loaned_at, notes, books(id, title, author, cover_url)")
    .is("returned_at", null)
    .order("loaned_at", { ascending: true });

  return (data ?? [])
    .filter((r) => r.books)
    .map((r) => ({
      id: r.id,
      borrower_name: r.borrower_name,
      loaned_at: r.loaned_at,
      notes: r.notes,
      book: r.books as unknown as ActiveLoan["book"],
    }));
}

/** Nombres de prestatarios ya usados, para autocompletar (CA-7.7). */
export async function getBorrowerNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loans")
    .select("borrower_name")
    .order("loaned_at", { ascending: false })
    .limit(200);
  return Array.from(new Set((data ?? []).map((r) => r.borrower_name)));
}

/** Días transcurridos desde una fecha (dato informativo, sin alertas). */
export function daysSince(dateISO: string): number {
  const ms = Date.now() - new Date(dateISO + "T00:00:00").getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Detección de duplicados: por ISBN, o por título+autor si no hay ISBN. */
export async function findDuplicate(
  isbn: string | null,
  title: string,
  author: string | null,
): Promise<{ id: string; title: string; status: string } | null> {
  const supabase = await createClient();
  let query = supabase.from("books").select("id, title, status");

  if (isbn) {
    query = query.eq("isbn", isbn);
  } else {
    query = query.ilike("title", title.trim());
    if (author) query = query.ilike("author", author.trim());
  }

  const { data } = await query.limit(1).maybeSingle();
  return data ?? null;
}
