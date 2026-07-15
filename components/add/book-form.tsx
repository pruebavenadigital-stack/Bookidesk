"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { createBook, checkDuplicate } from "@/lib/actions/books";
import { READING_STATUS_LABEL, type ReadingStatus } from "@/lib/supabase/types";
import { CoverPicker } from "./cover-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type BookFormInitial = {
  title?: string;
  author?: string | null;
  isbn?: string | null;
  cover_url?: string | null;
  genre?: string | null;
  publisher?: string | null;
  published_year?: number | null;
  synopsis?: string | null;
};

type Destination = "owned" | "wishlist";

export function BookForm({
  initial,
  onBack,
}: {
  initial: BookFormInitial;
  onBack?: () => void;
}) {
  const router = useRouter();

  const [destination, setDestination] = useState<Destination>("owned");
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>("pendiente");

  const [title, setTitle] = useState(initial.title ?? "");
  const [author, setAuthor] = useState(initial.author ?? "");
  const [isbn, setIsbn] = useState(initial.isbn ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(initial.cover_url ?? null);
  const [genre, setGenre] = useState(initial.genre ?? "");
  const [publisher, setPublisher] = useState(initial.publisher ?? "");
  const [year, setYear] = useState(
    initial.published_year != null ? String(initial.published_year) : "",
  );
  const [synopsis, setSynopsis] = useState(initial.synopsis ?? "");
  const [wishlistNote, setWishlistNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ title: string; status: string } | null>(null);

  function buildInput() {
    return {
      title: title.trim(),
      author,
      isbn,
      cover_url: coverUrl ?? "",
      genre,
      publisher,
      published_year: year,
      synopsis,
      wishlist_note: destination === "wishlist" ? wishlistNote : "",
      tags,
    };
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 20) setTags([...tags, t]);
    setTagInput("");
  }

  async function save() {
    setSaving(true);
    setError(null);
    const input = buildInput();
    const res = await createBook(
      input,
      destination,
      destination === "owned" ? readingStatus : undefined,
    );
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    toast.success(
      destination === "owned" ? "Libro agregado a la biblioteca." : "Agregado a la lista de deseos.",
    );
    router.push(destination === "owned" ? `/biblioteca/${res.id}` : "/deseos");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    const dup = await checkDuplicate(isbn.trim() || null, title.trim(), author.trim() || null);
    if (dup) {
      setSaving(false);
      setDuplicate({ title: dup.title, status: dup.status });
      return;
    }
    await save();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Destino */}
      <div className="space-y-2">
        <Label>¿A dónde va?</Label>
        <div className="inline-flex rounded-lg border p-0.5">
          <SegBtn active={destination === "owned"} onClick={() => setDestination("owned")}>
            A la biblioteca
          </SegBtn>
          <SegBtn active={destination === "wishlist"} onClick={() => setDestination("wishlist")}>
            A la lista de deseos
          </SegBtn>
        </div>
      </div>

      {destination === "owned" ? (
        <div className="space-y-2">
          <Label htmlFor="reading-status">Estado de lectura</Label>
          <Select value={readingStatus} onValueChange={(v) => setReadingStatus(v as ReadingStatus)}>
            <SelectTrigger id="reading-status" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(READING_STATUS_LABEL) as ReadingStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {READING_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <CoverPicker title={title} value={coverUrl} onChange={setCoverUrl} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título *" className="sm:col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={300} />
        </Field>
        <Field label="Autor">
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={300} />
        </Field>
        <Field label="Género">
          <Input value={genre} onChange={(e) => setGenre(e.target.value)} maxLength={120} />
        </Field>
        <Field label="Editorial">
          <Input value={publisher} onChange={(e) => setPublisher(e.target.value)} maxLength={200} />
        </Field>
        <Field label="Año">
          <Input
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
            inputMode="numeric"
          />
        </Field>
        <Field label="ISBN" className="sm:col-span-2">
          <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} className="font-mono" maxLength={20} />
        </Field>
        <Field label="Sinopsis" className="sm:col-span-2">
          <Textarea value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={4} maxLength={5000} />
        </Field>
        {destination === "wishlist" ? (
          <Field label="Nota (dónde lo vi, precio, quién lo recomendó)" className="sm:col-span-2">
            <Input value={wishlistNote} onChange={(e) => setWishlistNote(e.target.value)} maxLength={500} />
          </Field>
        ) : null}

        <Field label="Etiquetas" className="sm:col-span-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                {t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Quitar ${t}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder="Escribe y presiona Enter"
            className="mt-2"
          />
        </Field>
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {destination === "owned" ? "Agregar a la biblioteca" : "Agregar a deseos"}
        </Button>
        {onBack ? (
          <Button type="button" variant="ghost" onClick={onBack} disabled={saving}>
            Volver a buscar
          </Button>
        ) : null}
      </div>

      <AlertDialog open={!!duplicate} onOpenChange={(o) => !o && setDuplicate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Puede que ya lo tengas</AlertDialogTitle>
            <AlertDialogDescription>
              «{duplicate?.title}» ya está en{" "}
              {duplicate?.status === "wishlist" ? "la lista de deseos" : "la biblioteca"}. ¿Agregarlo de
              todos modos? (Puede haber dos ejemplares a propósito.)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDuplicate(null);
                void save();
              }}
            >
              Agregar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
