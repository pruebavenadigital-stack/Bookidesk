import Image from "next/image";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  ["#4d1322", "#722033", "#8c2a40"],
  ["#23374d", "#37506b", "#4a6789"],
  ["#33141c", "#4d1322", "#722033"],
  ["#2d4a38", "#3e7d5a", "#5fa37b"],
  ["#5a4322", "#a5813a", "#d4a94e"],
];

function pick(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

function initials(title: string) {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 || /\d/.test(w));
  const src = words.length ? words : title.trim().split(/\s+/);
  return (
    src
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/**
 * Portada de un libro. Usa next/image cuando hay URL; si no, genera un
 * placeholder de marca (gradiente + iniciales + lomo dorado).
 * El contenedor define la relación de aspecto (ej. aspect-[2/3]).
 */
export function BookCover({
  title,
  coverUrl,
  className,
  sizes = "(max-width: 768px) 40vw, 160px",
  priority = false,
}: {
  title: string;
  coverUrl?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (coverUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image
          src={coverUrl}
          alt={`Portada de ${title}`}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      </div>
    );
  }

  const [a, b, c] = pick(title);
  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden p-3",
        className,
      )}
      style={{ background: `linear-gradient(150deg, ${a}, ${b} 60%, ${c})` }}
      aria-label={`Portada de ${title}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-2 w-[3px] rounded"
        style={{ background: "rgba(212,169,78,0.5)" }}
      />
      <span
        className="font-display text-2xl font-bold leading-tight text-cream drop-shadow"
        style={{ color: "#f6efe0" }}
      >
        {initials(title)}
      </span>
    </div>
  );
}
