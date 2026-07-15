"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { BookCard, BookRow } from "./book-card";
import { cn } from "@/lib/utils";
import type { BookWithMeta } from "@/lib/books/queries";

type ViewMode = "grid" | "list";
const KEY = "biblioteca-view";

export function LibraryView({ books }: { books: BookWithMeta[] }) {
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "grid" || saved === "list") setView(saved);
  }, []);

  const change = (v: ViewMode) => {
    setView(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  };

  return (
    <div className="mt-4">
      <div className="mb-3 flex justify-end">
        <div className="inline-flex rounded-lg border p-0.5">
          <ToggleButton
            active={view === "grid"}
            onClick={() => change("grid")}
            label="Cuadrícula"
          >
            <LayoutGrid className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            active={view === "list"}
            onClick={() => change("list")}
            label="Lista"
          >
            <List className="h-4 w-4" />
          </ToggleButton>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {books.map((book) => (
            <BookRow key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
