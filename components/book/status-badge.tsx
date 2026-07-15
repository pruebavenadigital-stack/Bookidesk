import { cn } from "@/lib/utils";
import {
  READING_STATUS_LABEL,
  READING_STATUS_COLOR,
  type ReadingStatus,
} from "@/lib/supabase/types";

/** Insignia de estado de lectura, con el color del token correspondiente. */
export function ReadingStatusBadge({
  status,
  className,
}: {
  status: ReadingStatus;
  className?: string;
}) {
  const color = READING_STATUS_COLOR[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {READING_STATUS_LABEL[status]}
    </span>
  );
}

/** Insignia de "Prestado" para superponer en la portada. */
export function LoanedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm",
        className,
      )}
      style={{ backgroundColor: "var(--status-loaned)" }}
    >
      Prestado
    </span>
  );
}
