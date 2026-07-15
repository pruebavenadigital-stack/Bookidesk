"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { upsertReview, deleteReview } from "@/lib/actions/reviews";
import { StarRatingInput } from "./star-rating-input";
import { StarRatingDisplay } from "./star-rating-display";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewWithAuthor } from "@/lib/books/queries";

/** Evento que emite el control de estado al marcar un libro como "Leído". */
export const RATE_NOW_EVENT = "booki:rate-now";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function ReviewsSection({
  bookId,
  reviews,
  currentUserId,
}: {
  bookId: string;
  reviews: ReviewWithAuthor[];
  currentUserId: string;
}) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const mine = reviews.find((r) => r.user_id === currentUserId) ?? null;
  const others = reviews.filter((r) => r.user_id !== currentUserId);

  const [rating, setRating] = useState<number | null>(mine?.rating ?? null);
  const [text, setText] = useState(mine?.review_text ?? "");
  const [saving, setSaving] = useState(false);
  const [highlight, setHighlight] = useState(false);

  // Al marcar "Leído", el control de estado emite el evento: traemos aquí la vista.
  useEffect(() => {
    const onRateNow = () => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlight(true);
      setTimeout(() => setHighlight(false), 2200);
    };
    window.addEventListener(RATE_NOW_EVENT, onRateNow);
    return () => window.removeEventListener(RATE_NOW_EVENT, onRateNow);
  }, []);

  async function save() {
    setSaving(true);
    const res = await upsertReview(bookId, rating, text);
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Tu reseña quedó guardada.");
    router.refresh();
  }

  async function remove() {
    setSaving(true);
    const res = await deleteReview(bookId);
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setRating(null);
    setText("");
    toast.success("Reseña eliminada.");
    router.refresh();
  }

  return (
    <section ref={sectionRef} className="mt-8 max-w-2xl scroll-mt-20">
      <h2 className="mb-3 font-display text-lg font-semibold">
        Reseñas del hogar
      </h2>

      {/* Mi reseña */}
      <div
        className={
          "rounded-lg border p-4 transition-colors " +
          (highlight ? "border-ring bg-accent/5" : "")
        }
      >
        <p className="mb-3 text-sm font-medium">
          {mine ? "Tu reseña" : "¿Qué te pareció?"}
        </p>
        <StarRatingInput value={rating} onChange={setRating} disabled={saving} />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="Tu percepción, tu crítica… (opcional)"
          className="mt-3"
          disabled={saving}
        />
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mine ? "Actualizar reseña" : "Guardar reseña"}
          </Button>
          {mine ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={remove}
              disabled={saving}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          ) : null}
        </div>
      </div>

      {/* Reseñas de los demás */}
      {others.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {others.map((r) => (
            <li key={r.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: r.profiles?.avatar_color ?? "#722033" }}
                >
                  {initials(r.profiles?.display_name ?? "?")}
                </span>
                <span className="text-sm font-medium">
                  {r.profiles?.display_name ?? "Alguien de la casa"}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {fmtDate(r.updated_at)}
                </span>
              </div>
              {r.rating != null ? (
                <StarRatingDisplay rating={r.rating} size={14} className="mt-2" />
              ) : null}
              {r.review_text ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                  {r.review_text}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
