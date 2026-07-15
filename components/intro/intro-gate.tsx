"use client";

import { useEffect, useState } from "react";
import { BookiIntro } from "./booki-intro";

const KEY = "booki-intro-seen";

/** Muestra la intro animada una sola vez por sesión del navegador. */
export function IntroGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KEY)) setShow(true);
    } catch {
      // sessionStorage no disponible → no mostrar
    }
  }, []);

  if (!show) return null;

  return (
    <BookiIntro
      onDone={() => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        setShow(false);
      }}
    />
  );
}
