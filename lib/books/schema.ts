import { z } from "zod";

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

/** Datos editables de un libro (comunes a biblioteca y deseos). */
export const bookInputSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(300),
  author: z.preprocess(emptyToNull, z.string().trim().max(300).nullable()),
  isbn: z.preprocess(emptyToNull, z.string().trim().max(20).nullable()),
  cover_url: z.preprocess(emptyToNull, z.string().trim().url().max(1000).nullable()),
  genre: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
  publisher: z.preprocess(emptyToNull, z.string().trim().max(200).nullable()),
  published_year: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().min(0).max(2100).nullable(),
  ),
  synopsis: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()),
  wishlist_note: z.preprocess(emptyToNull, z.string().trim().max(500).nullable()),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});

export type BookInput = z.infer<typeof bookInputSchema>;

export const READING_STATUS_VALUES = [
  "pendiente",
  "leyendo",
  "leido",
  "abandonado",
] as const;
