import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BookiDesk — La biblioteca del hogar",
    short_name: "BookiDesk",
    description:
      "El catálogo de los libros de la casa: estados de lectura, reseñas, citas, deseos y préstamos.",
    start_url: "/biblioteca",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es",
    background_color: "#1d0a0f",
    theme_color: "#1d0a0f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
