import { createClient } from "@/lib/supabase/client";

/**
 * Comprime y redimensiona una imagen en el cliente (canvas) antes de subirla,
 * para no agotar el almacenamiento (bucket con límite de 2 MB).
 */
export async function compressImage(
  file: File,
  maxDim = 1200,
  quality = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("compress-failed"))),
      "image/webp",
      quality,
    ),
  );
}

/** Comprime y sube una portada al bucket `covers`; devuelve su URL pública. */
export async function uploadCover(file: File): Promise<string> {
  const blob = await compressImage(file);
  if (blob.size > 2 * 1024 * 1024) {
    // Reintenta con menor calidad si aún supera el límite.
    const smaller = await compressImage(file, 900, 0.7);
    if (smaller.size <= 2 * 1024 * 1024) return doUpload(smaller);
    throw new Error("La imagen es demasiado pesada.");
  }
  return doUpload(blob);
}

async function doUpload(blob: Blob): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = `${user?.id ?? "anon"}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("covers")
    .upload(path, blob, { contentType: "image/webp", upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("covers").getPublicUrl(path);
  return data.publicUrl;
}
