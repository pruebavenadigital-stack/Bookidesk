import type { Metadata } from "next";
import { PageHeader, ComingSoon } from "@/components/page-header";

export const metadata: Metadata = { title: "Agregar libro — BookiDesk" };

export default function AgregarPage() {
  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Agregar libro"
        description="Busca por título, autor o ISBN — o escanea el código de barras."
      />
      <ComingSoon note="Aquí vivirá el alta asistida por Google Books + escáner (Fase 1)." />
    </div>
  );
}
