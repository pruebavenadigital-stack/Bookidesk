"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Pencil, Trash2, Plus, Loader2, Quote as QuoteIcon } from "lucide-react";
import { addQuote, updateQuote, deleteQuote } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import type { QuoteWithAuthor } from "@/lib/books/queries";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function QuotesSection({
  bookId,
  quotes,
}: {
  bookId: string;
  quotes: QuoteWithAuthor[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await addQuote(bookId, text, page ? Number(page) : null);
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setText("");
    setPage("");
    setAdding(false);
    toast.success("Cita guardada.");
    router.refresh();
  }

  return (
    <section className="mt-8 max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          Citas {quotes.length > 0 ? `(${quotes.length})` : ""}
        </h2>
        {!adding ? (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Agregar cita
          </Button>
        ) : null}
      </div>

      {adding ? (
        <div className="mb-4 rounded-lg border p-4">
          <Label htmlFor="q-text">Cita</Label>
          <Textarea
            id="q-text"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="El pasaje que no quieres olvidar…"
            className="mt-2"
          />
          <div className="mt-3 flex items-end gap-3">
            <div className="w-28">
              <Label htmlFor="q-page">Página</Label>
              <Input
                id="q-page"
                value={page}
                onChange={(e) => setPage(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
                inputMode="numeric"
                placeholder="opcional"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar cita
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAdding(false);
                  setText("");
                  setPage("");
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {quotes.length === 0 && !adding ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Aún no hay citas de este libro. Guarda los pasajes que quieras recordar.
        </p>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => (
            <QuoteItem key={q.id} quote={q} bookId={bookId} />
          ))}
        </ul>
      )}
    </section>
  );
}

function QuoteItem({
  quote,
  bookId,
}: {
  quote: QuoteWithAuthor;
  bookId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(quote.quote_text);
  const [page, setPage] = useState(
    quote.page_number != null ? String(quote.page_number) : "",
  );
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function save() {
    setBusy(true);
    const res = await updateQuote(quote.id, bookId, text, page ? Number(page) : null);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setEditing(false);
    toast.success("Cita actualizada.");
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const res = await deleteQuote(quote.id, bookId);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setConfirmOpen(false);
    toast.success("Cita eliminada.");
    router.refresh();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(quote.quote_text);
      toast.success("Cita copiada.");
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  if (editing) {
    return (
      <li className="rounded-lg border p-4">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} />
        <div className="mt-3 flex items-end gap-3">
          <div className="w-28">
            <Label htmlFor={`p-${quote.id}`}>Página</Label>
            <Input
              id={`p-${quote.id}`}
              value={page}
              onChange={(e) => setPage(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
              inputMode="numeric"
              className="mt-2"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={busy}>
              Cancelar
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="group relative rounded-lg border p-4 pl-5">
      <span
        aria-hidden
        className="absolute inset-y-3 left-0 w-[3px] rounded-full"
        style={{ background: "var(--gold-500)" }}
      />
      <QuoteIcon
        aria-hidden
        className="absolute right-4 top-4 h-4 w-4 opacity-10"
        style={{ color: "var(--gold-500)" }}
      />
      <blockquote className="whitespace-pre-line text-sm leading-relaxed">
        {quote.quote_text}
      </blockquote>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {quote.page_number != null ? (
          <span className="font-mono">p. {quote.page_number}</span>
        ) : null}
        {quote.page_number != null ? <span>·</span> : null}
        <span>{quote.profiles?.display_name ?? "Alguien de la casa"}</span>
        <span>·</span>
        <span>{fmtDate(quote.created_at)}</span>

        <div className="ml-auto flex items-center gap-0.5">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copy} aria-label="Copiar cita">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)} aria-label="Editar cita">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
            aria-label="Eliminar cita"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                remove();
              }}
              disabled={busy}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
