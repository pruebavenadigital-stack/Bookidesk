import { cn } from "@/lib/utils";

/** Wordmark de marca: Booki + Desk (dorado). */
export function BookiWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight text-foreground",
        className,
      )}
    >
      Booki<span className="text-gold-text">Desk</span>
    </span>
  );
}
