"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { BookCard, BookRow } from "./book-card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { READING_STATUS_LABEL, type ReadingStatus } from "@/lib/supabase/types";
import type { BookWithMeta } from "@/lib/books/queries";

type ViewMode = "grid" | "list";
const KEY = "biblioteca-view";
const ALL = "__all__";

/** Normaliza para buscar sin tildes ni mayúsculas. */
const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function LibraryView({ books }: { books: BookWithMeta[] }) {
  const [view, setView] = useState<ViewMode>("grid");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [genre, setGenre] = useState(ALL);
  const [tag, setTag] = useState(ALL);
  const [minRating, setMinRating] = useState(ALL);
  const [loaned, setLoaned] = useState(ALL);
  const [sort, setSort] = useState("recent");

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

  const genres = useMemo(
    () =>
      Array.from(new Set(books.map((b) => b.genre).filter((g): g is string => !!g))).sort(
        (a, b) => a.localeCompare(b, "es"),
      ),
    [books],
  );
  const tags = useMemo(
    () => Array.from(new Set(books.flatMap((b) => b.tags))).sort((a, b) => a.localeCompare(b, "es")),
    [books],
  );

  const shown = useMemo(() => {
    let list = books;
    const needle = norm(q.trim());
    if (needle) {
      list = list.filter(
        (b) => norm(b.title).includes(needle) || norm(b.author ?? "").includes(needle),
      );
    }
    if (status !== ALL) list = list.filter((b) => b.reading_status === status);
    if (genre !== ALL) list = list.filter((b) => b.genre === genre);
    if (tag !== ALL) list = list.filter((b) => b.tags.includes(tag));
    if (minRating !== ALL)
      list = list.filter((b) => (b.avgRating ?? 0) >= Number(minRating));
    if (loaned !== ALL)
      list = list.filter((b) => (loaned === "yes" ? !!b.activeLoan : !b.activeLoan));

    const sorted = [...list];
    if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title, "es"));
    else if (sort === "author")
      sorted.sort((a, b) => (a.author ?? "").localeCompare(b.author ?? "", "es"));
    else if (sort === "rating")
      sorted.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
    return sorted;
  }, [books, q, status, genre, tag, minRating, loaned, sort]);

  const anyFilter =
    q !== "" || status !== ALL || genre !== ALL || tag !== ALL || minRating !== ALL || loaned !== ALL;

  function clearAll() {
    setQ("");
    setStatus(ALL);
    setGenre(ALL);
    setTag(ALL);
    setMinRating(ALL);
    setLoaned(ALL);
  }

  return (
    <div className="mt-4">
      {/* Buscador + orden + vista */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título o autor…"
            className="pl-9"
            aria-label="Buscar en la biblioteca"
          />
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44" aria-label="Ordenar">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recién agregados</SelectItem>
            <SelectItem value="title">Título A-Z</SelectItem>
            <SelectItem value="author">Autor A-Z</SelectItem>
            <SelectItem value="rating">Mejor calificados</SelectItem>
          </SelectContent>
        </Select>

        <div className="inline-flex rounded-lg border p-0.5">
          <ToggleButton active={view === "grid"} onClick={() => change("grid")} label="Cuadrícula">
            <LayoutGrid className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={view === "list"} onClick={() => change("list")} label="Lista">
            <List className="h-4 w-4" />
          </ToggleButton>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <FilterSelect value={status} onChange={setStatus} label="Estado" allLabel="Todos los estados">
          {(Object.keys(READING_STATUS_LABEL) as ReadingStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {READING_STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </FilterSelect>

        {genres.length > 0 ? (
          <FilterSelect value={genre} onChange={setGenre} label="Género" allLabel="Todos los géneros">
            {genres.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </FilterSelect>
        ) : null}

        {tags.length > 0 ? (
          <FilterSelect value={tag} onChange={setTag} label="Etiqueta" allLabel="Todas las etiquetas">
            {tags.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </FilterSelect>
        ) : null}

        <FilterSelect value={minRating} onChange={setMinRating} label="Calificación" allLabel="Cualquier calificación">
          <SelectItem value="3">3+ estrellas</SelectItem>
          <SelectItem value="4">4+ estrellas</SelectItem>
          <SelectItem value="4.5">4.5+ estrellas</SelectItem>
        </FilterSelect>

        <FilterSelect value={loaned} onChange={setLoaned} label="Préstamo" allLabel="Prestados y no">
          <SelectItem value="yes">Solo prestados</SelectItem>
          <SelectItem value="no">Solo disponibles</SelectItem>
        </FilterSelect>

        {anyFilter ? (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        ) : null}
      </div>

      {anyFilter ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {shown.length} {shown.length === 1 ? "resultado" : "resultados"}
        </p>
      ) : null}

      {shown.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Ningún libro coincide con la búsqueda.
        </p>
      ) : view === "grid" ? (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-2">
          {shown.map((book) => (
            <BookRow key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  allLabel,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  allLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn("h-8 w-auto gap-1.5 text-xs", value !== ALL && "border-ring text-foreground")}
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {children}
      </SelectContent>
    </Select>
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
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
