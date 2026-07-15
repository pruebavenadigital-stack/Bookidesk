import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { getWishlist } from "@/lib/books/queries";
import { PageHeader } from "@/components/page-header";
import { WishlistCard } from "@/components/wishlist/wishlist-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Lista de deseos — BookiDesk" };

export default async function DeseosPage() {
  const books = await getWishlist();

  return (
    <div className="px-4 py-6 md:px-8">
      <PageHeader
        title="Lista de deseos"
        description="Libros que queremos comprar."
      />

      {books.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">
            Sin libros deseados
          </h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Anota los libros que quieras comprar. Cuando los tengas, pasan a la
            biblioteca con un toque.
          </p>
          <Button asChild className="mt-5">
            <Link href="/agregar">
              <Plus className="h-4 w-4" />
              Agregar un deseo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <WishlistCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
