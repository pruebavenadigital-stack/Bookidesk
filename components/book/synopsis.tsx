"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sinopsis plegable. Las sinopsis de las APIs pueden ser larguísimas y
 * empujarían las reseñas y citas fuera de la vista.
 */
export function Synopsis({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const isLong = text.length > 420;

  return (
    <div>
      <p
        className={cn(
          "whitespace-pre-line text-sm leading-relaxed text-muted-foreground",
          isLong && !open && "line-clamp-6",
        )}
      >
        {text}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-sm font-medium text-foreground underline underline-offset-4 hover:text-accent"
          aria-expanded={open}
        >
          {open ? "Ver menos" : "Ver más"}
        </button>
      ) : null}
    </div>
  );
}
