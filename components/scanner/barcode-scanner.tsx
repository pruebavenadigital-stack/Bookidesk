"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Escáner de código de barras EAN-13 (= ISBN). Usa la cámara vía ZXing.
 * Requiere HTTPS (o localhost). Llama a onDetected con el ISBN limpio.
 */
export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (isbn: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let controls: IScannerControls | undefined;
    let done = false;

    const video = videoRef.current;
    if (!video) return;

    reader
      .decodeFromVideoDevice(undefined, video, (result, _err, ctrl) => {
        setStarting(false);
        if (done) return;
        if (result) {
          const text = result.getText().replace(/[^0-9Xx]/g, "");
          if (text.length === 13 || text.length === 10) {
            done = true;
            ctrl.stop();
            onDetected(text);
          }
        }
      })
      .then((c) => {
        controls = c;
        if (done) c.stop();
      })
      .catch(() => {
        setStarting(false);
        setError(
          "No se pudo abrir la cámara. Revisa los permisos del navegador (y que sea HTTPS).",
        );
      });

    return () => {
      done = true;
      controls?.stop();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black/95">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-medium">Escanea el código de barras</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        {/* Marco de escaneo */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-32 w-72 max-w-[80vw] rounded-lg border-2 border-gold/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
        </div>
        {starting && !error ? (
          <div className="absolute inset-0 grid place-items-center text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : null}
      </div>

      <div className="p-4 text-center text-sm text-white/80">
        {error ? (
          <p className="text-white">{error}</p>
        ) : (
          "Apunta al código de barras de la contraportada."
        )}
      </div>
    </div>
  );
}
