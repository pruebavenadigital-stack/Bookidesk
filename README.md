# BookiDesk

Aplicación web para la gestión de la biblioteca del hogar: un inventario compartido de todos los libros de la casa, con estados de lectura, calificaciones y reseñas, lista de deseos y control de préstamos.

## ¿Qué hace?

- **Biblioteca** — catálogo compartido con portada, autor y datos de cada libro, clasificados por estado de lectura (pendiente, leyendo, leído, abandonado).
- **Calificaciones y reseñas** — cada miembro del hogar puntúa con estrellas y escribe su crítica personal; el libro muestra el promedio.
- **Lista de deseos** — libros por comprar, con foto y título, que pasan a la biblioteca con un clic al comprarlos.
- **Préstamos** — registro de qué libro se prestó, a quién y cuándo, con su historial.

Es una aplicación **multiusuario con base de datos compartida**: no hay bibliotecas individuales, sino una sola biblioteca del hogar.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript |
| Estilos / UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Metadatos de libros | Google Books API (+ Open Library como respaldo de portadas) |
| Despliegue | Vercel (PWA responsive) |

## Documentación

El documento de requisitos completo (funcionalidades, modelo de datos, decisiones de diseño y plan de implementación) está en [`PRD.md`](./PRD.md).

## Estado

En desarrollo — Fase 0 (fundaciones).
