import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { getActiveLoans, daysSince } from "@/lib/books/queries";
import { PageHeader } from "@/components/page-header";
import { BookCover } from "@/components/book/book-cover";

export const metadata: Metadata = { title: "Préstamos — BookiDesk" };

function fmt(dateISO: string) {
  return new Date(dateISO + "T00:00:00").toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function PrestamosPage() {
  const loans = await getActiveLoans();

  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Préstamos"
        description="Los libros que están fuera de casa."
      />

      {loans.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <ArrowLeftRight className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">
            Todos los libros están en casa
          </h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Cuando prestes un libro, desde su ficha, aparecerá aquí para que sepas
            quién lo tiene.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            {loans.length} {loans.length === 1 ? "libro prestado" : "libros prestados"}
          </p>
          <ul className="mt-4 flex max-w-2xl flex-col gap-2">
            {loans.map((loan) => {
              const days = daysSince(loan.loaned_at);
              return (
                <li key={loan.id}>
                  <Link
                    href={`/biblioteca/${loan.book.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50"
                  >
                    <BookCover
                      title={loan.book.title}
                      coverUrl={loan.book.cover_url}
                      className="h-16 w-11 shrink-0 rounded"
                      sizes="44px"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-sm font-semibold">
                        {loan.book.title}
                      </h3>
                      {loan.book.author ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {loan.book.author}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm">
                        Lo tiene{" "}
                        <span className="font-medium">{loan.borrower_name}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-muted-foreground">
                        {fmt(loan.loaned_at)}
                      </div>
                      <div className="text-xs tabular-nums text-muted-foreground">
                        {days} {days === 1 ? "día" : "días"}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
