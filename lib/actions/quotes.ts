"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type QuoteResult = { ok?: boolean; error?: string };

function validate(text: string, page: number | null): string | null {
  const clean = text.trim();
  if (!clean) return "Escribe la cita.";
  if (clean.length > 2000) return "La cita es demasiado larga (máx. 2.000).";
  if (page != null && (!Number.isInteger(page) || page < 1)) {
    return "La página debe ser un número mayor que cero.";
  }
  return null;
}

/** Agrega una cita. Las citas son contenido compartido del hogar (PRD §8.4). */
export async function addQuote(
  bookId: string,
  text: string,
  page: number | null,
): Promise<QuoteResult> {
  const err = validate(text, page);
  if (err) return { error: err };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase.from("quotes").insert({
    book_id: bookId,
    quote_text: text.trim(),
    page_number: page,
    added_by: user.id,
  });
  if (error) return { error: "No se pudo guardar la cita." };

  revalidatePath(`/biblioteca/${bookId}`);
  return { ok: true };
}

/** Edita una cita (cualquier miembro puede corregirla). */
export async function updateQuote(
  id: string,
  bookId: string,
  text: string,
  page: number | null,
): Promise<QuoteResult> {
  const err = validate(text, page);
  if (err) return { error: err };

  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({
      quote_text: text.trim(),
      page_number: page,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: "No se pudo actualizar la cita." };

  revalidatePath(`/biblioteca/${bookId}`);
  return { ok: true };
}

export async function deleteQuote(
  id: string,
  bookId: string,
): Promise<QuoteResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar la cita." };

  revalidatePath(`/biblioteca/${bookId}`);
  return { ok: true };
}
