"use client";

import { useEffect } from "react";

/** Registra el service worker (solo en producción) para poder instalar la PWA. */
export function PwaRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Si falla, la app funciona igual; solo no se podrá instalar.
      });
    }
  }, []);
  return null;
}
