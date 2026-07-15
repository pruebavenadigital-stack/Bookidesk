"use client";

import { useState } from "react";
import { Star } from "lucide-react";

/** Selector de calificación: 0.5 a 5 estrellas, en pasos de media estrella. */
export function StarRatingInput({
  value,
  onChange,
  size = 30,
  disabled = false,
}: {
  value: number | null;
  onChange: (v: number) => void;
  size?: number;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;

  return (
    <div
      className="inline-flex items-center gap-2"
      onMouseLeave={() => setHover(null)}
    >
      <div className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = shown >= i ? 100 : shown >= i - 0.5 ? 50 : 0;
          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              <Star
                className="absolute inset-0"
                style={{ width: size, height: size, color: "var(--star-empty)" }}
                fill="currentColor"
                strokeWidth={0}
              />
              {fill > 0 ? (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill}%` }}
                >
                  <Star
                    style={{ width: size, height: size, color: "var(--star)" }}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </div>
              ) : null}

              {!disabled ? (
                <>
                  <button
                    type="button"
                    aria-label={`${i - 0.5} estrellas`}
                    className="absolute inset-y-0 left-0 w-1/2 rounded-l outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onMouseEnter={() => setHover(i - 0.5)}
                    onFocus={() => setHover(i - 0.5)}
                    onClick={() => onChange(i - 0.5)}
                  />
                  <button
                    type="button"
                    aria-label={`${i} estrellas`}
                    className="absolute inset-y-0 right-0 w-1/2 rounded-r outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={() => onChange(i)}
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      <span className="w-8 text-sm tabular-nums text-muted-foreground">
        {shown > 0 ? shown.toFixed(1) : "—"}
      </span>
    </div>
  );
}
