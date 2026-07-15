"use client";

import { useMemo, useState } from "react";
import { BookCard } from "./book-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookWithMeta } from "@/lib/books/queries";

const ALL = "__all__";

export function RecommendView({ books }: { books: BookWithMeta[] }) {
  const [genre, setGenre] = useState<string>(ALL);

  const genres = useMemo(
    () =>
      Array.from(
        new Set(books.map((b) => b.genre).filter((g): g is string => !!g)),
      ).sort((a, b) => a.localeCompare(b, "es")),
    [books],
  );

  const shown = useMemo(
    () => (genre === ALL ? books : books.filter((b) => b.genre === genre)),
    [books, genre],
  );

  return (
    <div className="mt-4">
      {genres.length > 0 ? (
        <div className="mb-4 flex items-center gap-2">
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-56" aria-label="Filtrar por género">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los géneros</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {shown.length} {shown.length === 1 ? "libro" : "libros"}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {shown.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
