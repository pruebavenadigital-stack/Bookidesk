"use client";

import { useRef, useState } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadCover } from "@/lib/images";
import { BookCover } from "@/components/book/book-cover";
import { Button } from "@/components/ui/button";

export function CoverPicker({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCover(file);
      onChange(url);
    } catch {
      toast.error("No se pudo subir la imagen. Intenta con otra.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-md border">
        <BookCover title={title || "Libro"} coverUrl={value} className="h-full w-full" sizes="96px" />
        {uploading ? (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          La portada suele llegar automáticamente. Si no, tómala o súbela.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => cameraRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            Tomar foto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Subir
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4" />
              Quitar
            </Button>
          ) : null}
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
