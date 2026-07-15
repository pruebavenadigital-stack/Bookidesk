import type { Metadata } from "next";
import { PageHeader, ComingSoon } from "@/components/page-header";

export const metadata: Metadata = { title: "Recomendar — BookiDesk" };

export default function RecomendarPage() {
  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Recomendar"
        description="Los libros mejor calificados de la casa."
      />
      <ComingSoon note="Aquí vivirá la vista de recomendaciones (Fase 2)." />
    </div>
  );
}
