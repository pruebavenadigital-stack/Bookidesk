import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getOwnedBooks } from "@/lib/books/queries";
import { PageHeader } from "@/components/page-header";
import { RecommendView } from "@/components/book/recommend-view";

export const metadata: Metadata = { title: "Recomendar — BookiDesk" };

export default async function RecomendarPage() {
  const books = (await getOwnedBooks())
    .filter((b) => b.avgRating != null)
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Recomendar"
        description="Los libros mejor calificados de la casa, de mayor a menor."
      />

      {books.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Sparkles className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">
            Todavía no hay calificaciones
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Cuando califiquen libros con estrellas, aquí aparecerán ordenados
            para responder rápido «¿qué me recomiendas?».
          </p>
        </div>
      ) : (
        <RecommendView books={books} />
      )}
    </div>
  );
}
