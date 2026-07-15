"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LoanResult = { ok?: boolean; error?: string };

function revalidate(bookId: string) {
  revalidatePath(`/biblioteca/${bookId}`);
  revalidatePath("/biblioteca");
  revalidatePath("/prestamos");
}

/** Fecha de hoy en formato YYYY-MM-DD (columna `date`). */
function isValidDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

/**
 * Registra un préstamo. La BD garantiza un solo préstamo activo por libro
 * (índice único parcial `one_active_loan_per_book`).
 */
export async function lendBook(
  bookId: string,
  borrowerName: string,
  loanedAt: string,
  notes: string | null,
): Promise<LoanResult> {
  const name = borrowerName.trim();
  if (!name) return { error: "Escribe a quién se lo prestaste." };
  if (name.length > 120) return { error: "El nombre es demasiado largo." };
  if (!isValidDate(loanedAt)) return { error: "La fecha no es válida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase.from("loans").insert({
    book_id: bookId,
    borrower_name: name,
    loaned_at: loanedAt,
    notes: notes?.trim() ? notes.trim() : null,
    created_by: user.id,
  });

  if (error) {
    // El índice único salta si ya hay un préstamo activo para este libro.
    if (error.code === "23505") {
      return { error: "Este libro ya está prestado. Márcalo como devuelto primero." };
    }
    return { error: "No se pudo registrar el préstamo." };
  }

  revalidate(bookId);
  return { ok: true };
}

/** Cierra un préstamo con su fecha de devolución (pasa al historial). */
export async function returnBook(
  loanId: string,
  bookId: string,
  returnedAt: string,
): Promise<LoanResult> {
  if (!isValidDate(returnedAt)) return { error: "La fecha no es válida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase
    .from("loans")
    .update({ returned_at: returnedAt })
    .eq("id", loanId);

  if (error) {
    // La restricción returned_after_loaned impide devolver antes de prestar.
    if (error.code === "23514") {
      return { error: "La devolución no puede ser anterior al préstamo." };
    }
    return { error: "No se pudo marcar como devuelto." };
  }

  revalidate(bookId);
  return { ok: true };
}

export async function deleteLoan(
  loanId: string,
  bookId: string,
): Promise<LoanResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("loans").delete().eq("id", loanId);
  if (error) return { error: "No se pudo eliminar el registro." };
  revalidate(bookId);
  return { ok: true };
}
