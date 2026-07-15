import Link from "next/link";
import { BookCover } from "./book-cover";
import { StarRatingDisplay } from "./star-rating-display";
import { ReadingStatusBadge, LoanedBadge } from "./status-badge";
import type { BookWithMeta } from "@/lib/books/queries";

export function BookCard({ book }: { book: BookWithMeta }) {
  return (
    <Link
      href={`/biblioteca/${book.id}`}
      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:shadow-md">
        <BookCover
          title={book.title}
          coverUrl={book.cover_url}
          className="h-full w-full"
        />
        {book.activeLoan ? (
          <LoanedBadge className="absolute left-2 top-2" />
        ) : null}
      </div>
      <div className="mt-2 space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {book.title}
        </h3>
        {book.author ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {book.author}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
          <ReadingStatusBadge status={book.myStatus} />
          {book.avgRating != null ? (
            <StarRatingDisplay
              rating={book.avgRating}
              count={book.ratingCount}
              size={13}
            />
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/** Fila para la vista de lista. */
export function BookRow({ book }: { book: BookWithMeta }) {
  return (
    <Link
      href={`/biblioteca/${book.id}`}
      className="flex items-center gap-3 rounded-lg border p-2 outline-none transition-colors hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <BookCover
        title={book.title}
        coverUrl={book.cover_url}
        className="h-16 w-11 shrink-0 rounded"
        sizes="44px"
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <h3 className="line-clamp-1 text-sm font-semibold">{book.title}</h3>
        {book.author ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {book.author}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          {book.avgRating != null ? (
            <StarRatingDisplay rating={book.avgRating} size={12} />
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {book.activeLoan ? <LoanedBadge /> : null}
        <ReadingStatusBadge status={book.myStatus} />
      </div>
    </Link>
  );
}
