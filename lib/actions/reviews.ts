"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewResult = { ok?: boolean; error?: string };

function revalidate(bookId: string) {
  revalidatePath(`/biblioteca/${bookId}`);
  revalidatePath("/biblioteca");
  revalidatePath("/recomendar");
}

/**
 * Crea o actualiza LA reseña del usuario actual para un libro
 * (una por usuario por libro — unique(book_id, user_id)).
 */
export async function upsertReview(
  bookId: string,
  rating: number | null,
  text: string | null,
): Promise<ReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const cleanText = text?.trim() ? text.trim() : null;

  if (rating == null && !cleanText) {
    return { error: "Pon una calificación o escribe una reseña." };
  }
  if (rating != null && (rating < 0.5 || rating > 5 || (rating * 2) % 1 !== 0)) {
    return { error: "Calificación inválida." };
  }
  if (cleanText && cleanText.length > 5000) {
    return { error: "La reseña es demasiado larga." };
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      book_id: bookId,
      user_id: user.id,
      rating,
      review_text: cleanText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "book_id,user_id" },
  );

  if (error) return { error: "No se pudo guardar tu reseña." };

  revalidate(bookId);
  return { ok: true };
}

/** Elimina la reseña del usuario actual (RLS impide borrar las ajenas). */
export async function deleteReview(bookId: string): Promise<ReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("book_id", bookId)
    .eq("user_id", user.id);

  if (error) return { error: "No se pudo eliminar tu reseña." };

  revalidate(bookId);
  return { ok: true };
}
