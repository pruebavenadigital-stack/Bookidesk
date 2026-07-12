/**
 * Integración de metadatos de libros para BookiDesk.
 *
 * Proveedores:
 *  1. Google Books API (principal) — datos ricos y buenas portadas.
 *     Requiere una clave gratuita en GOOGLE_BOOKS_API_KEY. Sin clave, desde
 *     IPs de datacenter (p. ej. Vercel) Google responde 429 (cuota del proyecto
 *     anónimo compartido = 0), por eso se recomienda la clave para el proxy.
 *  2. Open Library (respaldo) — 100% sin clave, funciona en cualquier entorno.
 *
 * Este módulo NO depende de Next.js: se usa desde el route handler
 * `app/api/books/search` (lado servidor) para evitar CORS y ocultar la clave.
 *
 * Todo se normaliza al shape que espera la tabla `books` de Supabase.
 */

/** Metadatos normalizados, listos para precargar el formulario de alta. */
export interface BookMetadata {
  title: string;
  author: string | null;
  isbn: string | null;
  coverUrl: string | null;
  genre: string | null;
  publisher: string | null;
  publishedYear: number | null;
  synopsis: string | null;
  /** Proveedor del que salió el dato (útil para depurar/telemetría). */
  source: "google-books" | "open-library";
}

const GOOGLE_BOOKS_ENDPOINT = "https://www.googleapis.com/books/v1/volumes";
const OPEN_LIBRARY_SEARCH = "https://openlibrary.org/search.json";
const OPEN_LIBRARY_COVER = "https://covers.openlibrary.org/b/isbn";

const DEFAULT_TIMEOUT_MS = 8000;

/** fetch con timeout para que un proveedor lento no cuelgue la petición. */
async function fetchJson(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BookiDesk/1.0 (biblioteca del hogar)" },
    });
    if (!res.ok) return null; // 429, 404, etc. → deja que el llamador use el respaldo
    return await res.json();
  } catch {
    return null; // timeout / red caída → respaldo
  } finally {
    clearTimeout(timer);
  }
}

function firstFourDigitsToYear(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const match = String(value).match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

/** Portada por ISBN desde Open Library (imagen directa, sin API). */
function openLibraryCoverByIsbn(isbn: string | null): string | null {
  if (!isbn) return null;
  // `-L` = large; `?default=false` hace que devuelva 404 si no existe (no un placeholder gris).
  return `${OPEN_LIBRARY_COVER}/${encodeURIComponent(isbn)}-L.jpg?default=false`;
}

/** Normaliza y asegura HTTPS en portadas de Google (a veces vienen en http + &edge=curl). */
function cleanGoogleCover(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:/, "https:").replace(/&edge=curl/, "");
}

// ---------------------------------------------------------------------------
// Google Books
// ---------------------------------------------------------------------------

interface GoogleVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    categories?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
}

function pickIsbn(ids?: { type: string; identifier: string }[]): string | null {
  if (!ids) return null;
  return (
    ids.find((i) => i.type === "ISBN_13")?.identifier ??
    ids.find((i) => i.type === "ISBN_10")?.identifier ??
    null
  );
}

function mapGoogleVolume(vol: GoogleVolume): BookMetadata | null {
  const info = vol.volumeInfo;
  if (!info?.title) return null;
  const isbn = pickIsbn(info.industryIdentifiers);
  return {
    title: info.title,
    author: info.authors?.join(", ") ?? null,
    isbn,
    coverUrl: cleanGoogleCover(info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail) ??
      openLibraryCoverByIsbn(isbn),
    genre: info.categories?.[0] ?? null,
    publisher: info.publisher ?? null,
    publishedYear: firstFourDigitsToYear(info.publishedDate),
    synopsis: info.description ?? null,
    source: "google-books",
  };
}

function googleBooksUrl(query: string, maxResults: number): string | null {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (!key) return null; // sin clave no vale la pena: 429 asegurado en servidor
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    printType: "books",
    key,
  });
  return `${GOOGLE_BOOKS_ENDPOINT}?${params.toString()}`;
}

async function searchGoogleBooks(query: string, maxResults: number): Promise<BookMetadata[]> {
  const url = googleBooksUrl(query, maxResults);
  if (!url) return [];
  const data = (await fetchJson(url)) as { items?: GoogleVolume[] } | null;
  if (!data?.items) return [];
  return data.items.map(mapGoogleVolume).filter((b): b is BookMetadata => b !== null);
}

// ---------------------------------------------------------------------------
// Open Library (respaldo sin clave)
// ---------------------------------------------------------------------------

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  isbn?: string[];
  first_publish_year?: number;
  publisher?: string[];
  cover_i?: number;
  subject?: string[];
}

function mapOpenLibraryDoc(doc: OpenLibraryDoc): BookMetadata | null {
  if (!doc.title) return null;
  const isbn = doc.isbn?.[0] ?? null;
  const coverUrl = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : openLibraryCoverByIsbn(isbn);
  return {
    title: doc.title,
    author: doc.author_name?.[0] ?? null,
    isbn,
    coverUrl,
    genre: doc.subject?.[0] ?? null,
    publisher: doc.publisher?.[0] ?? null,
    publishedYear: doc.first_publish_year ?? null,
    synopsis: null, // el endpoint de búsqueda no trae descripción
    source: "open-library",
  };
}

async function searchOpenLibrary(query: string, maxResults: number): Promise<BookMetadata[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(maxResults),
    fields: "title,author_name,isbn,first_publish_year,publisher,cover_i,subject",
  });
  const data = (await fetchJson(`${OPEN_LIBRARY_SEARCH}?${params.toString()}`)) as
    | { docs?: OpenLibraryDoc[] }
    | null;
  if (!data?.docs) return [];
  return data.docs.map(mapOpenLibraryDoc).filter((b): b is BookMetadata => b !== null);
}

// ---------------------------------------------------------------------------
// API pública del módulo
// ---------------------------------------------------------------------------

/**
 * Busca libros por texto libre (título, autor o ambos).
 * Intenta Google Books (si hay clave) y cae a Open Library si no hay
 * resultados o falla. Pensado para el buscador del flujo de alta.
 */
export async function searchBooks(query: string, maxResults = 8): Promise<BookMetadata[]> {
  const clean = query.trim();
  if (!clean) return [];
  const google = await searchGoogleBooks(clean, maxResults);
  if (google.length > 0) return google;
  return searchOpenLibrary(clean, maxResults);
}

/**
 * Busca un libro por ISBN (el caso del escáner de código de barras EAN-13).
 * Devuelve el mejor match o null. Google Books primero; Open Library de respaldo.
 */
export async function lookupByIsbn(rawIsbn: string): Promise<BookMetadata | null> {
  const isbn = rawIsbn.replace(/[^0-9Xx]/g, "");
  if (isbn.length !== 10 && isbn.length !== 13) return null;

  const google = await searchGoogleBooks(`isbn:${isbn}`, 1);
  if (google[0]) return google[0];

  // Respaldo: endpoint de datos por ISBN de Open Library
  const data = (await fetchJson(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  )) as Record<string, {
    title?: string;
    authors?: { name: string }[];
    publishers?: { name: string }[];
    publish_date?: string;
    subjects?: { name: string }[];
    cover?: { large?: string };
  }> | null;

  const rec = data?.[`ISBN:${isbn}`];
  if (!rec?.title) return null;
  return {
    title: rec.title,
    author: rec.authors?.map((a) => a.name).join(", ") ?? null,
    isbn,
    coverUrl: rec.cover?.large ?? openLibraryCoverByIsbn(isbn),
    genre: rec.subjects?.[0]?.name ?? null,
    publisher: rec.publishers?.[0]?.name ?? null,
    publishedYear: firstFourDigitsToYear(rec.publish_date),
    synopsis: null,
    source: "open-library",
  };
}
