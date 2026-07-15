"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { markPurchased, deleteBook } from "@/lib/actions/books";
import { BookCover } from "@/components/book/book-cover";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Book } from "@/lib/supabase/types";

export function WishlistCard({ book }: { book: Book }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function buy() {
    startTransition(async () => {
      const res = await markPurchased(book.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("¡A la biblioteca! Quedó como pendiente por leer.");
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteBook(book.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setConfirmOpen(false);
      toast.success("Quitado de la lista de deseos.");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 rounded-lg border p-3">
      <Link
        href={`/biblioteca/${book.id}`}
        className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-md border"
      >
        <BookCover
          title={book.title}
          coverUrl={book.cover_url}
          className="h-full w-full"
          sizes="80px"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/biblioteca/${book.id}`} className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold hover:underline">
            {book.title}
          </h3>
          {book.author ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {book.author}
            </p>
          ) : null}
        </Link>

        {book.wishlist_note ? (
          <p className="mt-1.5 line-clamp-2 text-xs italic text-muted-foreground">
            “{book.wishlist_note}”
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <Button size="sm" onClick={buy} disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
            ¡Ya lo compré!
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar de la lista de deseos?</AlertDialogTitle>
            <AlertDialogDescription>
              «{book.title}» se eliminará de tu lista de deseos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                remove();
              }}
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
