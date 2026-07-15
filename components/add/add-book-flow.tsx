"use client";

import { useRef, useState } from "react";
import { Search, ScanBarcode, PenLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BookMetadata } from "@/lib/book-metadata";
import { BookForm, type BookFormInitial } from "./book-form";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { BookCover } from "@/components/book/book-cover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function toInitial(m: BookMetadata): BookFormInitial {
  return {
    title: m.title,
    author: m.author,
    isbn: m.isbn,
    cover_url: m.coverUrl,
    genre: m.genre,
    publisher: m.publisher,
    published_year: m.publishedYear,
    synopsis: m.synopsis,
  };
}

export function AddBookFlow() {
  const [step, setStep] = useState<"search" | "form">("search");
  const [initial, setInitial] = useState<BookFormInitial>({});
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [scanning, setScanning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function runSearch(q: string) {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  function onQueryChange(v: string) {
    setQuery(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(v), 400);
  }

  async function onScanned(isbn: string) {
    setScanning(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/books/search?isbn=${encodeURIComponent(isbn)}`);
      const data = await res.json();
      const book = data.results?.[0] as BookMetadata | undefined;
      if (book) {
        openForm(toInitial(book));
      } else {
        toast.info("No encontramos ese ISBN. Complétalo a mano.");
        openForm({ isbn });
      }
    } catch {
      openForm({ isbn });
    } finally {
      setLoading(false);
    }
  }

  function openForm(data: BookFormInitial) {
    setInitial(data);
    setStep("form");
  }

  if (step === "form") {
    return (
      <div className="mt-6 max-w-2xl">
        <BookForm initial={initial} onBack={() => setStep("search")} />
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-2xl space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Título, autor o ISBN…"
          className="pl-9"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setScanning(true)}>
          <ScanBarcode className="h-4 w-4" />
          Escanear código
        </Button>
        <Button type="button" variant="ghost" onClick={() => openForm({ title: query })}>
          <PenLine className="h-4 w-4" />
          Agregar manualmente
        </Button>
      </div>

      {results.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {results.map((m, i) => (
            <li key={`${m.isbn ?? m.title}-${i}`}>
              <button
                type="button"
                onClick={() => openForm(toInitial(m))}
                className="flex w-full items-center gap-3 p-3 text-left outline-none transition-colors hover:bg-secondary/50 focus-visible:bg-secondary/50"
              >
                <BookCover
                  title={m.title}
                  coverUrl={m.coverUrl}
                  className="h-16 w-11 shrink-0 rounded"
                  sizes="44px"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold">{m.title}</div>
                  <div className="line-clamp-1 text-xs text-muted-foreground">
                    {[m.author, m.publishedYear].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : searched && !loading ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Sin resultados. Puedes{" "}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4"
            onClick={() => openForm({ title: query })}
          >
            agregarlo manualmente
          </button>
          .
        </p>
      ) : null}

      {scanning ? (
        <BarcodeScanner onDetected={onScanned} onClose={() => setScanning(false)} />
      ) : null}
    </div>
  );
}
