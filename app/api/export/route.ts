import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { READING_STATUS_LABEL, type ReadingStatus } from "@/lib/supabase/types";

/** Escapa un valor para CSV (comillas, comas y saltos de línea). */
function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  return /["\n\r,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

type ReviewRow = { rating: number | null };
type LoanRow = { borrower_name: string; returned_at: string | null };
type StatusRow = { status: string };

/**
 * Exporta toda la biblioteca (y los deseos) a CSV — respaldo de los datos del hogar.
 * GET /api/export
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no-auth" }, { status: 401 });

  const { data, error } = await supabase
    .from("books")
    .select(
      "*, reviews(rating), loans(borrower_name, returned_at), reading_statuses(status)",
    )
    .eq("reading_statuses.user_id", user.id)
    .order("title", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "export-failed" }, { status: 500 });
  }

  const headers = [
    "Título",
    "Autor",
    "ISBN",
    "Dónde está",
    "Mi estado de lectura",
    "Género",
    "Editorial",
    "Año",
    "Etiquetas",
    "Calificación promedio",
    "Reseñas",
    "Prestado a",
    "Nota del deseo",
    "Agregado el",
  ];

  const rows = (data ?? []).map((b) => {
    const reviews = (b.reviews ?? []) as ReviewRow[];
    const ratings = reviews
      .map((r) => r.rating)
      .filter((r): r is number => r != null);
    const avg =
      ratings.length > 0
        ? (ratings.reduce((a, c) => a + c, 0) / ratings.length).toFixed(1)
        : "";
    const active = ((b.loans ?? []) as LoanRow[]).find(
      (l) => l.returned_at === null,
    );
    // Mi estado (embed filtrado al usuario que exporta); sin fila = pendiente.
    const myStatus = ((b.reading_statuses ?? []) as StatusRow[])[0]?.status;

    return [
      b.title,
      b.author,
      b.isbn,
      b.status === "wishlist" ? "Lista de deseos" : "En la biblioteca",
      b.status === "owned"
        ? READING_STATUS_LABEL[(myStatus as ReadingStatus) ?? "pendiente"]
        : "",
      b.genre,
      b.publisher,
      b.published_year,
      (b.tags ?? []).join(" | "),
      avg,
      ratings.length || "",
      active?.borrower_name ?? "",
      b.wishlist_note,
      b.created_at?.slice(0, 10),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");

  // BOM: sin él, Excel abre los acentos como caracteres raros.
  const body = "﻿" + csv;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookidesk-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
