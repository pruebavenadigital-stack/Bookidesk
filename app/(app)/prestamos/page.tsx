import type { Metadata } from "next";
import { PageHeader, ComingSoon } from "@/components/page-header";

export const metadata: Metadata = { title: "Préstamos — BookiDesk" };

export default function PrestamosPage() {
  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Préstamos"
        description="Libros prestados y su historial."
      />
      <ComingSoon note="Aquí vivirá el registro de préstamos (Fase 3)." />
    </div>
  );
}
