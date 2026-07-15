import type { Metadata } from "next";
import { PageHeader, ComingSoon } from "@/components/page-header";

export const metadata: Metadata = { title: "Lista de deseos — BookiDesk" };

export default function DeseosPage() {
  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Lista de deseos"
        description="Libros que queremos comprar."
      />
      <ComingSoon note="Aquí vivirá la lista de deseos (Fase 2)." />
    </div>
  );
}
