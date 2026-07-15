"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, X, Loader2 } from "lucide-react";
import { updateBook } from "@/lib/actions/books";
import { CoverPicker } from "@/components/add/cover-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type EditableBook = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
  genre: string | null;
  publisher: string | null;
  published_year: number | null;
  synopsis: string | null;
  tags: string[];
};

export function EditBookDialog({ book }: { book: EditableBook }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? "");
  const [isbn, setIsbn] = useState(book.isbn ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(book.cover_url);
  const [genre, setGenre] = useState(book.genre ?? "");
  const [publisher, setPublisher] = useState(book.publisher ?? "");
  const [year, setYear] = useState(
    book.published_year != null ? String(book.published_year) : "",
  );
  const [synopsis, setSynopsis] = useState(book.synopsis ?? "");
  const [tags, setTags] = useState<string[]>(book.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 20) setTags([...tags, t]);
    setTagInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const res = await updateBook(book.id, {
      title: title.trim(),
      author,
      isbn,
      cover_url: coverUrl ?? "",
      genre,
      publisher,
      published_year: year,
      synopsis,
      wishlist_note: "",
      tags,
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Libro actualizado.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar libro</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <CoverPicker title={title} value={coverUrl} onChange={setCoverUrl} />
          <div className="space-y-2">
            <Label htmlFor="e-title">Título *</Label>
            <Input id="e-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="e-author">Autor</Label>
              <Input id="e-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-genre">Género</Label>
              <Input id="e-genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-publisher">Editorial</Label>
              <Input id="e-publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-year">Año</Label>
              <Input
                id="e-year"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-isbn">ISBN</Label>
            <Input id="e-isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-synopsis">Sinopsis</Label>
            <Textarea id="e-synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Etiquetas</Label>
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
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
