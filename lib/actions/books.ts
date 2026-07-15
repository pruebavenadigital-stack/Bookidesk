"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookInputSchema, READING_STATUS_VALUES } from "@/lib/books/schema";
import { findDuplicate } from "@/lib/books/queries";

export type BookActionResult = { id?: string; error?: string; ok?: boolean };

type Destination = "owned" | "wishlist";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function revalidateBook(id?: string) {
  revalidatePath("/biblioteca");
  revalidatePath("/deseos");
  revalidatePath("/recomendar");
  if (id) revalidatePath(`/biblioteca/${id}`);
}

export async function checkDuplicate(
  isbn: string | null,
  title: string,
  author: string | null,
): Promise<{ id: string; title: string; status: string } | null> {
  return findDuplicate(isbn, title, author);
}

export async function createBook(
  raw: unknown,
  destination: Destination,
  readingStatus?: string,
): Promise<BookActionResult> {
  const parsed = bookInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { data, error } = await supabase
    .from("books")
    .insert({
      ...parsed.data,
      status: destination,
      added_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: "No se pudo guardar el libro." };

  // El estado inicial elegido es la marca PERSONAL de quien lo agrega
  // (sin fila = pendiente, así que solo se guarda si es otro estado).
  if (
    destination === "owned" &&
    readingStatus &&
    readingStatus !== "pendiente" &&
    READING_STATUS_VALUES.includes(
      readingStatus as (typeof READING_STATUS_VALUES)[number],
    )
  ) {
    await supabase.from("reading_statuses").upsert(
      { book_id: data.id, user_id: user.id, status: readingStatus },
      { onConflict: "book_id,user_id" },
    );
  }

  revalidateBook(data.id);
  return { id: data.id };
}

export async function updateBook(
  id: string,
  raw: unknown,
): Promise<BookActionResult> {
  const parsed = bookInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase
    .from("books")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "No se pudo actualizar el libro." };

  revalidateBook(id);
  return { ok: true };
}

export async function setReadingStatus(
  id: string,
  status: string,
): Promise<BookActionResult> {
  if (
    !READING_STATUS_VALUES.includes(
      status as (typeof READING_STATUS_VALUES)[number],
    )
  ) {
    return { error: "Estado inválido." };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Tu sesión expiró." };

  // Solo los libros de la biblioteca tienen estado de lectura (no los deseados).
  const { data: book } = await supabase
    .from("books")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!book || book.status !== "owned") {
    return { error: "Este libro no está en la biblioteca." };
  }

  // La marca es PERSONAL: upsert de la fila del usuario actual (RLS lo garantiza).
  const { error } = await supabase.from("reading_statuses").upsert(
    {
      book_id: id,
      user_id: user.id,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "book_id,user_id" },
  );

  if (error) return { error: "No se pudo cambiar el estado." };

  revalidateBook(id);
  return { ok: true };
}

export async function markPurchased(id: string): Promise<BookActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Tu sesión expiró." };

  // Pasa a la biblioteca; sin filas en reading_statuses = pendiente para todos.
  const { error } = await supabase
    .from("books")
    .update({ status: "owned" })
    .eq("id", id)
    .eq("status", "wishlist");

  if (error) return { error: "No se pudo mover a la biblioteca." };

  revalidateBook(id);
  return { ok: true };
}

export async function deleteBook(id: string): Promise<BookActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar el libro." };

  revalidateBook(id);
  return { ok: true };
}
