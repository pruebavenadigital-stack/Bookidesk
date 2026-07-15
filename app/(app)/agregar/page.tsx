import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AddBookFlow } from "@/components/add/add-book-flow";

export const metadata: Metadata = { title: "Agregar libro — BookiDesk" };

export default function AgregarPage() {
  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Agregar libro"
        description="Busca por título, autor o ISBN — o escanea el código de barras."
      />
      <AddBookFlow />
    </div>
  );
}
