"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftRight, Loader2, Undo2 } from "lucide-react";
import { lendBook, returnBook } from "@/lib/actions/loans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoanRecord } from "@/lib/books/queries";

/** Fecha local de hoy en YYYY-MM-DD (no usar toISOString: es UTC). */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function fmt(dateISO: string) {
  return new Date(dateISO + "T00:00:00").toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysSince(dateISO: string) {
  const ms = Date.now() - new Date(dateISO + "T00:00:00").getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function LoansSection({
  bookId,
  loans,
  borrowerNames,
}: {
  bookId: string;
  loans: LoanRecord[];
  borrowerNames: string[];
}) {
  const router = useRouter();
  const active = loans.find((l) => l.returned_at === null) ?? null;
  const history = loans.filter((l) => l.returned_at !== null);

  const [lending, setLending] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [returnDate, setReturnDate] = useState(today());
  const [busy, setBusy] = useState(false);

  async function lend() {
    setBusy(true);
    const res = await lendBook(bookId, name, date, notes || null);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setName("");
    setNotes("");
    setDate(today());
    setLending(false);
    toast.success("Préstamo registrado.");
    router.refresh();
  }

  async function markReturned() {
    if (!active) return;
    setBusy(true);
    const res = await returnBook(active.id, bookId, returnDate);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("¡De vuelta en casa!");
    router.refresh();
  }

  return (
    <section className="mt-8 max-w-2xl">
      <h2 className="mb-3 font-display text-lg font-semibold">Préstamos</h2>

      {active ? (
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: "color-mix(in srgb, var(--status-loaned) 45%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--status-loaned) 8%, transparent)",
          }}
        >
          <p className="text-sm">
            Prestado a <span className="font-semibold">{active.borrower_name}</span>{" "}
            desde el {fmt(active.loaned_at)}.
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {daysSince(active.loaned_at)}{" "}
            {daysSince(active.loaned_at) === 1 ? "día" : "días"} fuera de casa
            {active.notes ? ` · ${active.notes}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="return-date" className="text-xs">
                Fecha de devolución
              </Label>
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="mt-1.5 w-44"
              />
            </div>
            <Button size="sm" onClick={markReturned} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
              Marcar devuelto
            </Button>
          </div>
        </div>
      ) : lending ? (
        <div className="rounded-lg border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="borrower">¿A quién se lo prestaste? *</Label>
              <Input
                id="borrower"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                list="borrower-names"
                placeholder="Nombre"
                className="mt-1.5"
                maxLength={120}
              />
              <datalist id="borrower-names">
                {borrowerNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="loan-date">Fecha del préstamo</Label>
              <Input
                id="loan-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="loan-notes">Nota (opcional)</Label>
              <Input
                id="loan-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Se lo llevó al viaje…"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={lend} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Registrar préstamo
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setLending(false)} disabled={busy}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setLending(true)}>
          <ArrowLeftRight className="h-4 w-4" />
          Prestar este libro
        </Button>
      )}

      {history.length > 0 ? (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Historial
          </h3>
          <ul className="space-y-1.5">
            {history.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-x-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-medium">{l.borrower_name}</span>
                <span className="text-xs text-muted-foreground">
                  {fmt(l.loaned_at)} → {l.returned_at ? fmt(l.returned_at) : "—"}
                </span>
                {l.notes ? (
                  <span className="text-xs italic text-muted-foreground">· {l.notes}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
