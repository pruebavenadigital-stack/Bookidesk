import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Muestra una calificación (0–5, con fracción) como estrellas doradas. */
export function StarRatingDisplay({
  rating,
  count,
  size = 16,
  className,
}: {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const stars = [0, 1, 2, 3, 4];

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="relative inline-flex">
        <div className="flex" style={{ color: "var(--star-empty)" }}>
          {stars.map((i) => (
            <Star key={i} style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex overflow-hidden"
          style={{ color: "var(--star)", width: `${pct}%` }}
        >
          {stars.map((i) => (
            <Star key={i} style={{ width: size, height: size, flex: "none" }} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {rating.toFixed(1)}
        {count != null && count > 0 ? ` · ${count}` : ""}
      </span>
    </div>
  );
}
