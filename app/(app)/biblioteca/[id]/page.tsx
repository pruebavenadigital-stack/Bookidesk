import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBookDetail, getBorrowerNames } from "@/lib/books/queries";
import { createClient } from "@/lib/supabase/server";
import { ReviewsSection } from "@/components/book/reviews-section";
import { QuotesSection } from "@/components/book/quotes-section";
import { LoansSection } from "@/components/book/loans-section";
import { Synopsis } from "@/components/book/synopsis";
import { BookCover } from "@/components/book/book-cover";
import { StarRatingDisplay } from "@/components/book/star-rating-display";
import { ReadingStatusControl } from "@/components/book/reading-status-control";
import { EditBookDialog } from "@/components/book/edit-book-dialog";
import { DeleteBookButton } from "@/components/book/delete-book-button";
import { LoanedBadge } from "@/components/book/status-badge";
import type { ReadingStatus } from "@/lib/supabase/types";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookDetail(id);
  if (!book) notFound();

  const supabase = await createClient();
  const [{ data: userData }, borrowerNames] = await Promise.all([
    supabase.auth.getUser(),
    getBorrowerNames(),
  ]);
  const user = userData.user;

  const ratings = book.reviews
    .map((r) => r.rating)
    .filter((r): r is number => r != null);
  const avg =
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const activeLoan = book.loans.find((l) => l.returned_at === null) ?? null;

  const meta: [string, string | null][] = [
    ["Género", book.genre],
    ["Editorial", book.publisher],
    ["Año", book.published_year ? String(book.published_year) : null],
    ["ISBN", book.isbn],
  ];

  return (
    <div className="px-4 py-6 md:px-8">
      <Link
        href={book.status === "wishlist" ? "/deseos" : "/biblioteca"}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {book.status === "wishlist" ? "Lista de deseos" : "Biblioteca"}
      </Link>

      <div className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-8">
        {/* Columna portada */}
        <div className="space-y-4">
          <div className="relative mx-auto aspect-[2/3] w-40 overflow-hidden rounded-lg border shadow-md md:w-full">
            <BookCover
              title={book.title}
              coverUrl={book.cover_url}
              className="h-full w-full"
              sizes="200px"
              priority
            />
            {activeLoan ? <LoanedBadge className="absolute left-2 top-2" /> : null}
          </div>
          {book.status === "owned" && book.reading_status ? (
            <ReadingStatusControl
              bookId={book.id}
              status={book.reading_status as ReadingStatus}
            />
          ) : null}
        </div>

        {/* Columna info */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl">
              {book.title}
            </h1>
            {book.author ? (
              <p className="text-lg text-muted-foreground">{book.author}</p>
            ) : null}
          </div>

          {avg != null ? (
            <StarRatingDisplay rating={avg} count={ratings.length} size={20} />
          ) : null}

          {activeLoan ? (
            <p className="text-sm">
              <span className="font-medium">Prestado a:</span>{" "}
              {activeLoan.borrower_name}
            </p>
          ) : null}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            {meta.map(([label, value]) =>
              value ? (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className={label === "ISBN" ? "font-mono text-xs" : ""}>
                    {value}
                  </dd>
                </div>
              ) : null,
            )}
          </dl>

          {book.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {book.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <EditBookDialog book={book} />
            <DeleteBookButton
              bookId={book.id}
              redirectTo={book.status === "wishlist" ? "/deseos" : "/biblioteca"}
            />
          </div>
        </div>
      </div>

      {book.synopsis ? (
        <section className="mt-8 max-w-2xl">
          <h2 className="mb-2 font-display text-lg font-semibold">Sinopsis</h2>
          <Synopsis text={book.synopsis} />
        </section>
      ) : null}

      {/* Reseñas y citas: solo para libros de la biblioteca (CA-6.5, CA-9.6) */}
      {book.status === "owned" && user ? (
        <>
          <LoansSection
            bookId={book.id}
            loans={book.loans}
            borrowerNames={borrowerNames}
          />
          <ReviewsSection
            bookId={book.id}
            reviews={book.reviews}
            currentUserId={user.id}
          />
          <QuotesSection bookId={book.id} quotes={book.quotes} />
        </>
      ) : null}
    </div>
  );
}
