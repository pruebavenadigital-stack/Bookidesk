// Service worker mínimo de BookiDesk.
// Su función es habilitar la instalación como PWA. La v1 NO cachea contenido
// a propósito: la app requiere conexión (PRD §9, "sin modo offline en v1"),
// y un caché mal hecho mostraría libros desactualizados.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// El navegador exige un listener de fetch para ofrecer instalar la app.
// Sin respondWith(), cada petición sigue su curso normal a la red.
self.addEventListener("fetch", () => {});
