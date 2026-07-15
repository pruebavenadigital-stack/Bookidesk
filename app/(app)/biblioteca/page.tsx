import type { Metadata } from "next";
import Link from "next/link";
import { Library, Plus } from "lucide-react";
import { getOwnedBooks, computeCounts } from "@/lib/books/queries";
import { PageHeader } from "@/components/page-header";
import { LibraryView } from "@/components/book/library-view";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Biblioteca — BookiDesk" };

export default async function BibliotecaPage() {
  const books = await getOwnedBooks();
  const counts = computeCounts(books);

  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader title="Biblioteca" description="Todos los libros de la casa." />

      {books.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Stat label="libros" value={counts.total} />
            <Stat label="leídos" value={counts.leidos} />
            <Stat label="leyendo" value={counts.leyendo} />
            <Stat label="pendientes" value={counts.pendientes} />
          </div>
          <LibraryView books={books} />
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function EmptyLibrary() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Library className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold">
        Tu biblioteca está vacía
      </h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Agrega tu primer libro buscándolo por título, autor o ISBN — o escanea
        su código de barras.
      </p>
      <Button asChild className="mt-5">
        <Link href="/agregar">
          <Plus className="h-4 w-4" />
          Agregar un libro
        </Link>
      </Button>
    </div>
  );
}
