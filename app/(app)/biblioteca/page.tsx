import type { Metadata } from "next";
import { PageHeader, ComingSoon } from "@/components/page-header";

export const metadata: Metadata = { title: "Biblioteca — BookiDesk" };

export default function BibliotecaPage() {
  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Biblioteca"
        description="Todos los libros de la casa."
      />
      <ComingSoon note="Aquí vivirá el catálogo de libros (Fase 1)." />
    </div>
  );
}
