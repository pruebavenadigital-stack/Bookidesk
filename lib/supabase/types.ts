import type { Tables } from "./database.types";

export type Book = Tables<"books">;
export type Profile = Tables<"profiles">;
export type Review = Tables<"reviews">;
export type Loan = Tables<"loans">;
export type Quote = Tables<"quotes">;

export type BookStatus = "owned" | "wishlist";

export type ReadingStatus = "pendiente" | "leyendo" | "leido" | "abandonado";

export const READING_STATUSES: ReadingStatus[] = [
  "pendiente",
  "leyendo",
  "leido",
  "abandonado",
];

export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  pendiente: "Pendiente por leer",
  leyendo: "Leyendo",
  leido: "Leído",
  abandonado: "Abandonado",
};

/** Clase de color (token de estado) para insignias por estado de lectura. */
export const READING_STATUS_COLOR: Record<ReadingStatus, string> = {
  pendiente: "var(--status-pending)",
  leyendo: "var(--status-reading)",
  leido: "var(--status-read)",
  abandonado: "var(--status-abandoned)",
};

/** Paleta de colores de avatar para el perfil. */
export const AVATAR_COLORS = [
  "#722033",
  "#d4a94e",
  "#23374d",
  "#3e7d5a",
  "#8c2a40",
  "#a5813a",
  "#6b6458",
];
