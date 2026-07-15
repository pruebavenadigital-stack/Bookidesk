import { BookiWordmark } from "@/components/brand/wordmark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Halo dorado de fondo (guiño a la animación del logo) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--gold-500) 18%, transparent) 0%, transparent 62%)",
        }}
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <BookiWordmark className="text-4xl" />
          <p className="mt-2 text-sm text-muted-foreground">
            La biblioteca del hogar
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
